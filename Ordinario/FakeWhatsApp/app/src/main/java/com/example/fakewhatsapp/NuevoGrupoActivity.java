package com.example.fakewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NuevoGrupoActivity extends AppCompatActivity {
    private SeleccionAdapter adapter;
    private EditText etNombre;
    private Button btnCrear;
    private final String miId = SessionManager.get().getUserId();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_nuevo_grupo);
        if (getSupportActionBar() != null) getSupportActionBar().hide();
        UiUtils.aplicarInsets(findViewById(R.id.root), findViewById(R.id.header));

        findViewById(R.id.btnAtras).setOnClickListener(v -> finish());
        etNombre = findViewById(R.id.etNombreGrupo);
        btnCrear = findViewById(R.id.btnCrear);

        adapter = new SeleccionAdapter(n ->
                btnCrear.setText(n == 0 ? "Crear grupo" : "Crear grupo (" + n + ")"));
        RecyclerView rv = findViewById(R.id.rvUsuarios);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);

        btnCrear.setOnClickListener(v -> crear());
        cargarUsuarios();
    }

    private void cargarUsuarios() {
        SupabaseClient.get().create(PerfilApi.class)
                .listar("*", "neq." + miId, null, "nombre.asc", 100)
                .enqueue(new Callback<List<Perfil>>() {
                    @Override
                    public void onResponse(Call<List<Perfil>> call, Response<List<Perfil>> r) {
                        if (r.isSuccessful() && r.body() != null) adapter.setItems(r.body());
                        else toast(AuthModels.errorMessage(r));
                    }

                    @Override
                    public void onFailure(Call<List<Perfil>> call, Throwable t) {
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    private void crear() {
        String nombre = etNombre.getText().toString().trim();
        if (nombre.isEmpty()) {
            toast("Escribe el nombre del grupo");
            return;
        }
        if (adapter.getSeleccionados().isEmpty()) {
            toast("Elige al menos un participante");
            return;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("nombre_grupo", nombre);
        body.put("miembros", new ArrayList<>(adapter.getSeleccionados()));

        btnCrear.setEnabled(false);
        SupabaseClient.get().create(ChatApi.class).crearGrupo(body)
                .enqueue(new Callback<String>() {
                    @Override
                    public void onResponse(Call<String> call, Response<String> r) {
                        btnCrear.setEnabled(true);
                        if (r.isSuccessful() && r.body() != null) {
                            startActivity(new Intent(NuevoGrupoActivity.this, ChatActivity.class)
                                    .putExtra("conversacion_id", r.body())
                                    .putExtra("nombre", nombre));
                            finish();
                        } else {
                            toast(AuthModels.errorMessage(r));
                        }
                    }

                    @Override
                    public void onFailure(Call<String> call, Throwable t) {
                        btnCrear.setEnabled(true);
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}