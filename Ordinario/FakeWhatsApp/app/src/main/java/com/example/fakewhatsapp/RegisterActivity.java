package com.example.fakewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.util.Collections;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {
    private EditText etNombre, etEmail, etPassword;
    private Button btnRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        etNombre = findViewById(R.id.etNombre);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnRegister = findViewById(R.id.btnRegister);

        btnRegister.setOnClickListener(v -> registrar());
        findViewById(R.id.tvLogin).setOnClickListener(v -> finish());
    }

    private void registrar() {
        String nombre = etNombre.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String pass = etPassword.getText().toString();

        if (nombre.isEmpty() || email.isEmpty() || pass.length() < 6) {
            toast("Completa todo. La contraseña debe tener mínimo 6 caracteres");
            return;
        }
        btnRegister.setEnabled(false);

        AuthModels.SignUpRequest body = new AuthModels.SignUpRequest(
                email, pass, Collections.singletonMap("nombre", nombre));

        SupabaseClient.get().create(AuthApi.class).signUp(body)
                .enqueue(new Callback<AuthModels.AuthResponse>() {
                    @Override
                    public void onResponse(Call<AuthModels.AuthResponse> call,
                                           Response<AuthModels.AuthResponse> r) {
                        btnRegister.setEnabled(true);
                        if (!r.isSuccessful() || r.body() == null) {
                            toast(AuthModels.errorMessage(r));
                            return;
                        }
                        if (r.body().accessToken != null) {
                            // Confirmación de correo desactivada: ya hay sesión
                            SessionManager.get().save(r.body());
                            Intent i = new Intent(RegisterActivity.this, MainActivity.class);
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                            startActivity(i);
                        } else {
                            toast("Cuenta creada. Confirma tu correo e inicia sesión");
                            finish();
                        }
                    }

                    @Override
                    public void onFailure(Call<AuthModels.AuthResponse> call, Throwable t) {
                        btnRegister.setEnabled(true);
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}