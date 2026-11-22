package com.example.fakewhatsapp;

import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {
    private EditText etEmail, etPassword;
    private Button btnLogin;
    private AuthApi api;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        api = SupabaseClient.get().create(AuthApi.class);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);

        btnLogin.setOnClickListener(v -> login());
        findViewById(R.id.tvRegister).setOnClickListener(v ->
                startActivity(new Intent(this, RegisterActivity.class)));
        findViewById(R.id.tvForgot).setOnClickListener(v -> mostrarDialogoRecuperar());
    }

    private void login() {
        String email = etEmail.getText().toString().trim();
        String pass = etPassword.getText().toString();
        if (email.isEmpty() || pass.isEmpty()) {
            toast("Completa todos los campos");
            return;
        }
        btnLogin.setEnabled(false);
        api.login(new AuthModels.LoginRequest(email, pass))
                .enqueue(new Callback<AuthModels.AuthResponse>() {
                    @Override
                    public void onResponse(Call<AuthModels.AuthResponse> call,
                                           Response<AuthModels.AuthResponse> r) {
                        btnLogin.setEnabled(true);
                        if (r.isSuccessful() && r.body() != null) {
                            SessionManager.get().save(r.body());
                            Intent i = new Intent(LoginActivity.this, MainActivity.class);
                            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                            startActivity(i);
                        } else {
                            toast(AuthModels.errorMessage(r));
                        }
                    }

                    @Override
                    public void onFailure(Call<AuthModels.AuthResponse> call, Throwable t) {
                        btnLogin.setEnabled(true);
                        toast("Sin conexión: " + t.getMessage());
                    }
                });
    }

    private void mostrarDialogoRecuperar() {
        EditText input = new EditText(this);
        input.setHint("Correo");
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        input.setText(etEmail.getText());

        new AlertDialog.Builder(this)
                .setTitle("Recuperar contraseña")
                .setView(input)
                .setPositiveButton("Enviar", (d, w) -> {
                    String email = input.getText().toString().trim();
                    if (email.isEmpty()) return;
                    api.recover(new AuthModels.RecoverRequest(email), "fakewhatsapp://reset")
                            .enqueue(new Callback<Void>() {
                                @Override
                                public void onResponse(Call<Void> call, Response<Void> r) {
                                    toast(r.isSuccessful()
                                            ? "Te enviamos un correo con el enlace"
                                            : AuthModels.errorMessage(r));
                                }

                                @Override
                                public void onFailure(Call<Void> call, Throwable t) {
                                    toast("Sin conexión: " + t.getMessage());
                                }
                            });
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}