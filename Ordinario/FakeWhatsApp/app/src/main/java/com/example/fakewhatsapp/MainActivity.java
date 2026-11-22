package com.example.fakewhatsapp;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Collections;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {
    private ChatsAdapter chatsAdapter;
    private ContactsAdapter usuariosAdapter;
    private ChatApi api;
    private PerfilApi perfilApi;
    private RealtimeClient realtime;
    private RecyclerView rv;
    private TextView tvVacio, tvSeccion;
    private EditText etBuscar;
    private View btnNuevoChat;
    private String miId;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable pendiente;
    private Call<List<Perfil>> busquedaActual;

    private final ActivityResultLauncher<Intent> contactosLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Intent d = result.getData();
                    abrirChatCon(d.getStringExtra("id"),
                            d.getStringExtra("nombre"),
                            d.getStringExtra("avatar_url"));
                }
            });

    // Fase 9: permiso de notificaciones (Android 13+)
    private final ActivityResultLauncher<String> permisoNotificaciones =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), concedido -> {
                if (!concedido) toast("Sin permiso no verás notificaciones de mensajes");
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (!SessionManager.get().isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        if (getSupportActionBar() != null) getSupportActionBar().hide();
        UiUtils.aplicarInsets(findViewById(R.id.root), findViewById(R.id.header));

        miId = SessionManager.get().getUserId();
        api = SupabaseClient.get().create(ChatApi.class);
        perfilApi = SupabaseClient.get().create(PerfilApi.class);

        tvVacio = findViewById(R.id.tvVacio);
        tvSeccion = findViewById(R.id.tvSeccion);

        chatsAdapter = new ChatsAdapter(miId, c -> abrirChat(c.conversacionId, c.titulo, c.foto));
        usuariosAdapter = new ContactsAdapter(p -> abrirChatCon(p.id, p.nombre, p.avatarUrl));

        rv = findViewById(R.id.rvChats);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(chatsAdapter);

        etBuscar = findViewById(R.id.etBuscar);
        etBuscar.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}

            @Override
            public void afterTextChanged(Editable s) {
                if (pendiente != null) handler.removeCallbacks(pendiente);
                pendiente = () -> onBusqueda();
                handler.postDelayed(pendiente, 300);
            }
        });

        btnNuevoChat = findViewById(R.id.btnNuevoChat);
        btnNuevoChat.setOnClickListener(v ->
                contactosLauncher.launch(new Intent(this, ContactsActivity.class)));
        findViewById(R.id.btnNuevoGrupo).setOnClickListener(v ->
                startActivity(new Intent(this, NuevoGrupoActivity.class)));
        findViewById(R.id.btnBuscarMensajes).setOnClickListener(v ->
                startActivity(new Intent(this, BuscarMensajesActivity.class)));
        findViewById(R.id.btnPerfil).setOnClickListener(v ->
                startActivity(new Intent(this, ProfileActivity.class)));
        findViewById(R.id.btnLogout).setOnClickListener(v -> cerrarSesion());

        // Fase 7: cualquier mensaje nuevo en mis chats (RLS filtra los ajenos)
        JSONArray cambios = new JSONArray()
                .put(RealtimeClient.cambio("INSERT", "mensajes", null));
        realtime = new RealtimeClient("chats-" + miId, cambios, new RealtimeClient.Listener() {
            @Override
            public void onConectado() {
                if (textoBusqueda().isEmpty()) cargarChats();
            }

            @Override
            public void onInsert(JSONObject record) {
                // Me llegó un mensaje con la app abierta: marcarlo como recibido
                if (!miId.equals(record.optString("remitente_id"))) App.ping(true);
                if (textoBusqueda().isEmpty()) cargarChats();
            }
        });

        // Fase 9: permiso y token FCM
        pedirPermisoNotificaciones();
        FcmHelper.registrar();
    }

    private void pedirPermisoNotificaciones() {
        if (Build.VERSION.SDK_INT >= 33
                && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            permisoNotificaciones.launch(Manifest.permission.POST_NOTIFICATIONS);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (realtime != null) realtime.conectar();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Al volver de un chat se recarga la lista (si no se está buscando)
        if (api != null && textoBusqueda().isEmpty()) mostrarChats();
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (realtime != null) realtime.desconectar();
    }

    private String textoBusqueda() {
        // Quitamos caracteres con significado especial en los filtros de Supabase
        return etBuscar.getText().toString().trim().replaceAll("[*,()]", "");
    }

    private void onBusqueda() {
        String limpio = textoBusqueda();
        if (limpio.isEmpty()) mostrarChats();
        else buscarUsuarios(limpio);
    }

    // ---------- Chats ----------

    private void mostrarChats() {
        if (busquedaActual != null) busquedaActual.cancel();
        tvSeccion.setText("Chats");
        if (rv.getAdapter() != chatsAdapter) rv.setAdapter(chatsAdapter);
        cargarChats();
    }

    private void cargarChats() {
        api.misChats(Collections.emptyMap()).enqueue(new Callback<List<Chat>>() {
            @Override
            public void onResponse(Call<List<Chat>> call, Response<List<Chat>> r) {
                if (!SessionManager.get().isLoggedIn()) { irALogin(); return; }
                if (r.isSuccessful() && r.body() != null) {
                    chatsAdapter.setItems(r.body());
                    if (rv.getAdapter() == chatsAdapter) {
                        mostrarVacio(r.body().isEmpty(),
                                "Aún no tienes chats.\nBusca a alguien o toca «Nuevo chat».");
                    }
                } else {
                    toast(AuthModels.errorMessage(r));
                }
            }

            @Override
            public void onFailure(Call<List<Chat>> call, Throwable t) {
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    // ---------- Usuarios (Fase 4: consultar y buscar) ----------

    private void buscarUsuarios(String texto) {
        if (busquedaActual != null) busquedaActual.cancel();
        tvSeccion.setText("Usuarios");
        if (rv.getAdapter() != usuariosAdapter) rv.setAdapter(usuariosAdapter);

        busquedaActual = perfilApi.listar("*", "neq." + miId,
                "ilike.*" + texto + "*", "nombre.asc", 50);
        busquedaActual.enqueue(new Callback<List<Perfil>>() {
            @Override
            public void onResponse(Call<List<Perfil>> call, Response<List<Perfil>> r) {
                if (call.isCanceled() || textoBusqueda().isEmpty()) return;
                if (r.isSuccessful() && r.body() != null) {
                    usuariosAdapter.setItems(r.body());
                    mostrarVacio(r.body().isEmpty(), "No se encontraron usuarios");
                } else {
                    toast(AuthModels.errorMessage(r));
                }
            }

            @Override
            public void onFailure(Call<List<Perfil>> call, Throwable t) {
                if (call.isCanceled()) return;
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    private void mostrarVacio(boolean vacio, String mensaje) {
        tvVacio.setText(mensaje);
        tvVacio.setVisibility(vacio ? View.VISIBLE : View.GONE);
    }

    // ---------- Abrir chat ----------

    // Busca o crea la conversación privada con el usuario elegido
    private void abrirChatCon(String otroId, String nombre, String avatar) {
        btnNuevoChat.setEnabled(false);
        api.obtenerOCrearChat(Collections.singletonMap("otro", otroId))
                .enqueue(new Callback<String>() {
                    @Override
                    public void onResponse(Call<String> call, Response<String> r) {
                        btnNuevoChat.setEnabled(true);
                        if (r.isSuccessful() && r.body() != null) {
                            abrirChat(r.body(), nombre, avatar);
                        } else {
                            toast(AuthModels.errorMessage(r));
                        }
                    }

                    @Override
                    public void onFailure(Call<String> call, Throwable t) {
                        btnNuevoChat.setEnabled(true);
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    private void abrirChat(String conversacionId, String nombre, String avatar) {
        etBuscar.setText(""); // al regresar se ven los chats
        startActivity(new Intent(this, ChatActivity.class)
                .putExtra("conversacion_id", conversacionId)
                .putExtra("nombre", nombre)
                .putExtra("avatar_url", avatar));
    }

    // ---------- Sesión ----------

    private void cerrarSesion() {
        App.ping(false);
        // Primero se borra el token FCM (aún con sesión), luego se cierra la sesión
        FcmHelper.eliminar(() ->
                SupabaseClient.get().create(AuthApi.class).logout().enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> r) { irALogin(); }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) { irALogin(); }
                }));
    }

    private void irALogin() {
        SessionManager.get().clear();
        Intent i = new Intent(this, LoginActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (pendiente != null) handler.removeCallbacks(pendiente);
        if (busquedaActual != null) busquedaActual.cancel();
        if (realtime != null) realtime.cerrar();
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}