package com.example.fakewhatsapp;

import android.content.Intent;
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
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.Collections;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BuscarMensajesActivity extends AppCompatActivity {
    private ResultadosAdapter adapter;
    private ChatApi api;
    private EditText etBuscar;
    private TextView tvVacio;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable pendiente;
    private Call<List<ResultadoBusqueda>> llamadaActual;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_buscar_mensajes);
        if (getSupportActionBar() != null) getSupportActionBar().hide();
        UiUtils.aplicarInsets(findViewById(R.id.root), findViewById(R.id.header));

        api = SupabaseClient.get().create(ChatApi.class);
        findViewById(R.id.btnAtras).setOnClickListener(v -> finish());
        tvVacio = findViewById(R.id.tvVacio);

        adapter = new ResultadosAdapter(SessionManager.get().getUserId(), this::abrir);
        RecyclerView rv = findViewById(R.id.rvResultados);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);

        etBuscar = findViewById(R.id.etBuscar);
        etBuscar.requestFocus();
        etBuscar.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}

            @Override
            public void afterTextChanged(Editable s) {
                if (pendiente != null) handler.removeCallbacks(pendiente);
                pendiente = () -> buscar(s.toString().trim());
                handler.postDelayed(pendiente, 300);
            }
        });
    }

    private void buscar(String texto) {
        if (llamadaActual != null) llamadaActual.cancel();
        if (texto.length() < 2) {
            adapter.setItems(Collections.emptyList());
            mostrarVacio(true, "Escribe al menos 2 letras");
            return;
        }

        llamadaActual = api.buscarMensajes(Collections.singletonMap("texto", texto));
        llamadaActual.enqueue(new Callback<List<ResultadoBusqueda>>() {
            @Override
            public void onResponse(Call<List<ResultadoBusqueda>> call, Response<List<ResultadoBusqueda>> r) {
                if (call.isCanceled()) return;
                if (r.isSuccessful() && r.body() != null) {
                    adapter.setItems(r.body());
                    mostrarVacio(r.body().isEmpty(), "No se encontraron mensajes");
                } else {
                    toast(AuthModels.errorMessage(r));
                }
            }

            @Override
            public void onFailure(Call<List<ResultadoBusqueda>> call, Throwable t) {
                if (call.isCanceled()) return;
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    private void abrir(ResultadoBusqueda r) {
        startActivity(new Intent(this, ChatActivity.class)
                .putExtra("conversacion_id", r.conversacionId)
                .putExtra("nombre", r.titulo)
                .putExtra("avatar_url", r.foto)
                .putExtra("mensaje_id", r.mensajeId));
    }

    private void mostrarVacio(boolean vacio, String mensaje) {
        tvVacio.setText(mensaje);
        tvVacio.setVisibility(vacio ? View.VISIBLE : View.GONE);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (pendiente != null) handler.removeCallbacks(pendiente);
        if (llamadaActual != null) llamadaActual.cancel();
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}