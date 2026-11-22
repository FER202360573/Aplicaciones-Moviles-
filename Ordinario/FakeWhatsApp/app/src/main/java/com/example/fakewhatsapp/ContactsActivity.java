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

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ContactsActivity extends AppCompatActivity {
    private ContactsAdapter adapter;
    private PerfilApi api;
    private TextView tvVacio;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable pendiente;
    private Call<List<Perfil>> llamadaActual;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contacts);
        api = SupabaseClient.get().create(PerfilApi.class);

        tvVacio = findViewById(R.id.tvVacio);
        adapter = new ContactsAdapter(this::seleccionar);
        RecyclerView rv = findViewById(R.id.rvContacts);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);

        EditText etBuscar = findViewById(R.id.etBuscar);
        etBuscar.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}

            @Override
            public void afterTextChanged(Editable s) {
                if (pendiente != null) handler.removeCallbacks(pendiente);
                pendiente = () -> buscar(s.toString());
                handler.postDelayed(pendiente, 300);
            }
        });

        buscar("");
    }

    private void buscar(String texto) {
        if (llamadaActual != null) llamadaActual.cancel();

        // Quitamos caracteres que tienen significado especial en los filtros de Supabase
        String limpio = texto.trim().replaceAll("[*,()]", "");
        String filtro = limpio.isEmpty() ? null : "ilike.*" + limpio + "*";

        llamadaActual = api.listar("*", "neq." + SessionManager.get().getUserId(),
                filtro, "nombre.asc", 50);
        llamadaActual.enqueue(new Callback<List<Perfil>>() {
            @Override
            public void onResponse(Call<List<Perfil>> call, Response<List<Perfil>> r) {
                if (call.isCanceled()) return;
                if (r.isSuccessful() && r.body() != null) {
                    adapter.setItems(r.body());
                    tvVacio.setVisibility(r.body().isEmpty() ? View.VISIBLE : View.GONE);
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

    // Seleccionar destinatario: se devuelve a la pantalla que nos abrió
    private void seleccionar(Perfil p) {
        Intent result = new Intent()
                .putExtra("id", p.id)
                .putExtra("nombre", p.nombre)
                .putExtra("avatar_url", p.avatarUrl);
        setResult(RESULT_OK, result);
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (pendiente != null) handler.removeCallbacks(pendiente);
        if (llamadaActual != null) llamadaActual.cancel();
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}