package com.example.fakewhatsapp;

import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChatActivity extends AppCompatActivity {
    // Chat que el usuario está viendo ahora (FcmService no lo notifica)
    public static volatile String conversacionVisible;

    private static final Callback<Void> IGNORAR = new Callback<Void>() {
        @Override public void onResponse(Call<Void> call, Response<Void> r) {}
        @Override public void onFailure(Call<Void> call, Throwable t) {}
    };

    private MensajesAdapter adapter;
    private RecyclerView rv;
    private EditText etMensaje;
    private View btnEnviar, btnAdjuntar;
    private TextView tvNombre, tvSubtitulo;
    private ImageView ivAvatar;
    private ChatApi api;
    private RealtimeClient realtime;
    private String conversacionId;
    private String avatarUrl;
    private String mensajeBuscado; // viene de la búsqueda de mensajes
    private final String miId = SessionManager.get().getUserId();
    private final Gson gson = new Gson();
    private final Handler handler = new Handler(Looper.getMainLooper());

    private boolean visible = false;
    private boolean esGrupo = false;
    private String quienEscribe;            // perfil_id de quien está escribiendo
    private long ultimoAvisoEscritura = 0;
    private EstadoChat estadoOtro;
    private final Map<String, String> nombres = new HashMap<>(); // miembros del grupo

    private final Runnable quitarEscribiendo = () -> {
        quienEscribe = null;
        pintarSubtitulo();
    };

    // "en línea / últ. vez" cada 20 s (solo chats privados)
    private final Runnable consultarEstadoCadaRato = new Runnable() {
        @Override
        public void run() {
            if (esGrupo) return;
            consultarEstado();
            handler.postDelayed(this, 20_000);
        }
    };

    // Fase 11: elegir foto de la galería (no necesita permisos)
    private final ActivityResultLauncher<PickVisualMediaRequest> picker =
            registerForActivityResult(new ActivityResultContracts.PickVisualMedia(), uri -> {
                if (uri != null) enviarImagen(uri);
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Si se abrió desde una notificación sin sesión, no hay nada que mostrar
        if (!SessionManager.get().isLoggedIn()) {
            finish();
            return;
        }

        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_chat);
        if (getSupportActionBar() != null) getSupportActionBar().hide();
        UiUtils.aplicarInsets(findViewById(R.id.root), findViewById(R.id.header));

        conversacionId = getIntent().getStringExtra("conversacion_id");
        if (conversacionId == null) {
            finish();
            return;
        }
        mensajeBuscado = getIntent().getStringExtra("mensaje_id");
        avatarUrl = getIntent().getStringExtra("avatar_url");
        api = SupabaseClient.get().create(ChatApi.class);

        // Flecha: regresa a la lista de chats
        findViewById(R.id.btnAtras).setOnClickListener(v -> finish());

        // Encabezado
        tvNombre = findViewById(R.id.tvNombre);
        tvSubtitulo = findViewById(R.id.tvSubtitulo);
        ivAvatar = findViewById(R.id.ivAvatar);
        tvNombre.setText(getIntent().getStringExtra("nombre"));
        Glide.with(this).load(avatarUrl)
                .placeholder(R.drawable.ic_person)
                .fallback(R.drawable.ic_person)
                .circleCrop().into(ivAvatar);
        // Fase 11: ver la foto de perfil en grande
        ivAvatar.setOnClickListener(v -> {
            if (!esGrupo) VerImagenActivity.abrir(this, avatarUrl, false);
        });

        adapter = new MensajesAdapter(miId, new MensajesAdapter.Acciones() {
            @Override
            public void onLongClick(Mensaje m) { confirmarEliminar(m); }

            @Override
            public void onImagenClick(Mensaje m) {
                VerImagenActivity.abrir(ChatActivity.this, m.contenido, true);
            }
        });
        rv = findViewById(R.id.rvMensajes);
        LinearLayoutManager lm = new LinearLayoutManager(this);
        lm.setStackFromEnd(true); // los mensajes empiezan desde abajo
        rv.setLayoutManager(lm);
        rv.setAdapter(adapter);
        // Si se abre el teclado, baja al último mensaje
        rv.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> {
            if (b < ob) rv.post(this::irAlFinal);
        });

        etMensaje = findViewById(R.id.etMensaje);
        btnEnviar = findViewById(R.id.btnEnviar);
        btnAdjuntar = findViewById(R.id.btnAdjuntar);
        btnEnviar.setOnClickListener(v -> enviarTexto());
        btnAdjuntar.setOnClickListener(v -> picker.launch(new PickVisualMediaRequest.Builder()
                .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
                .build()));

        // Indicador de escritura: avisa como máximo cada 2 s mientras se teclea
        etMensaje.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}

            @Override
            public void afterTextChanged(Editable s) {
                long ahora = System.currentTimeMillis();
                if (s.length() > 0 && ahora - ultimoAvisoEscritura > 2000) {
                    ultimoAvisoEscritura = ahora;
                    try {
                        realtime.broadcast("escribiendo", new JSONObject().put("user_id", miId));
                    } catch (JSONException ignored) {}
                }
            }
        });

        // Fase 7: mensajes nuevos y cambios (estados, eliminados) de esta conversación
        String filtro = "conversacion_id=eq." + conversacionId;
        JSONArray cambios = new JSONArray()
                .put(RealtimeClient.cambio("INSERT", "mensajes", filtro))
                .put(RealtimeClient.cambio("UPDATE", "mensajes", filtro));

        realtime = new RealtimeClient("chat-" + conversacionId, cambios, new RealtimeClient.Listener() {
            @Override
            public void onConectado() {
                cargarHistorial(); // recupera lo que llegó mientras no había conexión
            }

            @Override
            public void onInsert(JSONObject record) {
                recibido(gson.fromJson(record.toString(), Mensaje.class));
            }

            @Override
            public void onUpdate(JSONObject record) {
                adapter.actualizar(gson.fromJson(record.toString(), Mensaje.class));
            }

            @Override
            public void onBroadcast(String evento, JSONObject payload) {
                String quien = payload.optString("user_id");
                if ("escribiendo".equals(evento) && !quien.isEmpty() && !miId.equals(quien)) {
                    quienEscribe = quien;
                    pintarSubtitulo();
                    handler.removeCallbacks(quitarEscribiendo);
                    handler.postDelayed(quitarEscribiendo, 3000);
                }
            }
        });

        cargarConversacion();
        cargarHistorial();
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (realtime != null) realtime.conectar();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (api == null) return;
        visible = true;
        conversacionVisible = conversacionId;
        Notificaciones.cancelar(this, conversacionId); // ya se está viendo
        marcarLeidos();
        handler.post(consultarEstadoCadaRato);
    }

    @Override
    protected void onPause() {
        super.onPause();
        visible = false;
        if (conversacionId != null && conversacionId.equals(conversacionVisible)) {
            conversacionVisible = null;
        }
        handler.removeCallbacks(consultarEstadoCadaRato);
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (realtime != null) realtime.desconectar();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacksAndMessages(null);
        if (realtime != null) realtime.cerrar();
    }

    // ---------- Conversación y grupo ----------

    // Saber si es grupo (y su nombre) aunque se haya abierto desde una notificación
    private void cargarConversacion() {
        api.conversacion("eq." + conversacionId, "id,tipo,nombre")
                .enqueue(new Callback<List<Conversacion>>() {
                    @Override
                    public void onResponse(Call<List<Conversacion>> call, Response<List<Conversacion>> r) {
                        if (!r.isSuccessful() || r.body() == null || r.body().isEmpty()) return;
                        Conversacion c = r.body().get(0);
                        if (!"grupo".equals(c.tipo)) return;

                        esGrupo = true;
                        adapter.setEsGrupo(true);
                        if (c.nombre != null) tvNombre.setText(c.nombre);
                        Glide.with(ChatActivity.this).clear(ivAvatar);
                        ivAvatar.setImageResource(R.drawable.ic_group);
                        handler.removeCallbacks(consultarEstadoCadaRato);
                        cargarMiembros();
                    }

                    @Override
                    public void onFailure(Call<List<Conversacion>> call, Throwable t) {}
                });
    }

    private void cargarMiembros() {
        api.miembrosDe(Collections.singletonMap("conv", conversacionId))
                .enqueue(new Callback<List<Miembro>>() {
                    @Override
                    public void onResponse(Call<List<Miembro>> call, Response<List<Miembro>> r) {
                        if (!r.isSuccessful() || r.body() == null) return;
                        nombres.clear();
                        for (Miembro m : r.body()) nombres.put(m.perfilId, m.nombre);
                        adapter.setNombres(nombres);
                        pintarSubtitulo();
                    }

                    @Override
                    public void onFailure(Call<List<Miembro>> call, Throwable t) {}
                });
    }

    // ---------- Mensajes ----------

    // Últimos 100 mensajes: se piden del más nuevo al más viejo y se invierten
    private void cargarHistorial() {
        api.historial("eq." + conversacionId, "*", "creado_en.desc", 100)
                .enqueue(new Callback<List<Mensaje>>() {
                    @Override
                    public void onResponse(Call<List<Mensaje>> call, Response<List<Mensaje>> r) {
                        if (r.isSuccessful() && r.body() != null) {
                            List<Mensaje> lista = new ArrayList<>(r.body());
                            Collections.reverse(lista);
                            adapter.setItems(lista);

                            // Si se abrió desde la búsqueda, se posiciona en ese mensaje
                            int i = adapter.indiceDe(mensajeBuscado);
                            if (i >= 0) rv.scrollToPosition(i);
                            else irAlFinal();

                            if (visible) marcarLeidos();
                        } else {
                            toast(AuthModels.errorMessage(r));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Mensaje>> call, Throwable t) {
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    // Mensaje que llegó por Realtime
    private void recibido(Mensaje m) {
        if (!adapter.agregar(m)) return; // ya estaba (ej. el mío, que llegó por el POST)
        irAlFinal();
        if (!miId.equals(m.remitenteId)) {
            quienEscribe = null;
            handler.removeCallbacks(quitarEscribiendo);
            pintarSubtitulo();
            if (visible) marcarLeidos();
        }
    }

    private void enviarTexto() {
        String texto = etMensaje.getText().toString().trim();
        if (texto.isEmpty()) return;
        insertar(new Mensaje(conversacionId, miId, texto), btnEnviar, () -> etMensaje.setText(""));
    }

    // Fase 11: subir la foto al bucket privado y luego insertar el mensaje
    private void enviarImagen(Uri uri) {
        byte[] datos;
        try {
            datos = Imagenes.comprimir(this, uri, 1280);
        } catch (Exception e) {
            toast("No se pudo leer la imagen");
            return;
        }

        String ruta = conversacionId + "/" + UUID.randomUUID() + ".jpg";
        btnAdjuntar.setEnabled(false);
        toast("Enviando foto…");

        api.subirImagen(ruta, RequestBody.create(datos, MediaType.parse("image/jpeg")))
                .enqueue(new Callback<ResponseBody>() {
                    @Override
                    public void onResponse(Call<ResponseBody> call, Response<ResponseBody> r) {
                        if (r.isSuccessful()) {
                            insertar(new Mensaje(conversacionId, miId, ruta, "imagen"), btnAdjuntar, null);
                        } else {
                            btnAdjuntar.setEnabled(true);
                            toast("No se pudo subir la foto (" + r.code() + ")");
                        }
                    }

                    @Override
                    public void onFailure(Call<ResponseBody> call, Throwable t) {
                        btnAdjuntar.setEnabled(true);
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    private void insertar(Mensaje nuevo, View boton, Runnable siSale) {
        boton.setEnabled(false);
        api.enviar(nuevo).enqueue(new Callback<List<Mensaje>>() {
            @Override
            public void onResponse(Call<List<Mensaje>> call, Response<List<Mensaje>> r) {
                boton.setEnabled(true);
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    if (siSale != null) siSale.run();
                    adapter.agregar(r.body().get(0));
                    irAlFinal();
                } else {
                    toast(AuthModels.errorMessage(r));
                }
            }

            @Override
            public void onFailure(Call<List<Mensaje>> call, Throwable t) {
                boton.setEnabled(true);
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    // ---------- Fase 11: eliminar ----------

    private void confirmarEliminar(Mensaje m) {
        if (m.id == null || m.eliminado || !miId.equals(m.remitenteId)) return;
        new AlertDialog.Builder(this)
                .setTitle("¿Eliminar mensaje?")
                .setMessage("Se eliminará para todos en este chat.")
                .setPositiveButton("Eliminar", (d, w) -> eliminar(m))
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void eliminar(Mensaje m) {
        if (m.esImagen()) {
            // Primero se borra la foto de Storage; pase lo que pase, luego el mensaje
            api.borrarImagen(m.contenido).enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> r) { eliminarMensaje(m); }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) { eliminarMensaje(m); }
            });
        } else {
            eliminarMensaje(m);
        }
    }

    private void eliminarMensaje(Mensaje m) {
        api.eliminarMensaje(Collections.singletonMap("mensaje", m.id))
                .enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> r) {
                        if (r.isSuccessful()) {
                            // Se actualiza al momento (a los demás les llega por Realtime)
                            m.eliminado = true;
                            m.tipo = "texto";
                            m.contenido = "Mensaje eliminado";
                            adapter.actualizar(m);
                        } else {
                            toast(AuthModels.errorMessage(r));
                        }
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    // ---------- Fase 8: estados ----------

    private void marcarLeidos() {
        api.marcarLeidos(Collections.singletonMap("conv", conversacionId)).enqueue(IGNORAR);
    }

    private void consultarEstado() {
        api.estadoChat(Collections.singletonMap("conv", conversacionId))
                .enqueue(new Callback<List<EstadoChat>>() {
                    @Override
                    public void onResponse(Call<List<EstadoChat>> call, Response<List<EstadoChat>> r) {
                        if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                            estadoOtro = r.body().get(0);
                            pintarSubtitulo();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<EstadoChat>> call, Throwable t) {}
                });
    }

    private void pintarSubtitulo() {
        String texto;
        if (quienEscribe != null) {
            String quien = nombres.get(quienEscribe);
            texto = esGrupo && quien != null ? quien + " está escribiendo…" : "escribiendo…";
        } else if (esGrupo) {
            texto = listaParticipantes();
        } else if (estadoOtro != null && estadoOtro.enLinea) {
            texto = "en línea";
        } else if (estadoOtro != null && estadoOtro.ultimaConexion != null) {
            texto = "últ. vez " + Fechas.ultimaVez(estadoOtro.ultimaConexion);
        } else {
            texto = "";
        }

        tvSubtitulo.setText(texto);
        tvSubtitulo.setVisibility(texto.isEmpty() ? View.GONE : View.VISIBLE);
    }

    // "Ana, Luis, Tú"
    private String listaParticipantes() {
        List<String> otros = new ArrayList<>();
        for (Map.Entry<String, String> e : nombres.entrySet()) {
            if (!miId.equals(e.getKey())) otros.add(e.getValue());
        }
        Collections.sort(otros);
        otros.add("Tú");
        return android.text.TextUtils.join(", ", otros);
    }

    private void irAlFinal() {
        if (adapter.getItemCount() > 0) rv.scrollToPosition(adapter.getItemCount() - 1);
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}