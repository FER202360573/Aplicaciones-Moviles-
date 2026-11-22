package com.example.fakewhatsapp;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ResetPasswordActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reset_password);

        String token = null;
        Uri data = getIntent().getData();
        if (data != null && data.getFragment() != null) {
            token = Uri.parse("x://x?" + data.getFragment()).getQueryParameter("access_token");
        }
        if (token == null) {
            toast("Enlace inválido o expirado");
            finish();
            return;
        }

        final String bearer = "Bearer " + token;
        EditText etNew = findViewById(R.id.etNewPassword);

        findViewById(R.id.btnReset).setOnClickListener(v -> {
            String pass = etNew.getText().toString();
            if (pass.length() < 6) {
                toast("Mínimo 6 caracteres");
                return;
            }
            SupabaseClient.get().create(AuthApi.class)
                    .updatePassword(bearer, new AuthModels.UpdatePasswordRequest(pass))
                    .enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> r) {
                            if (r.isSuccessful()) {
                                toast("Contraseña actualizada. Inicia sesión");
                                SessionManager.get().clear();
                                Intent i = new Intent(ResetPasswordActivity.this, LoginActivity.class);
                                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                startActivity(i);
                            } else {
                                toast(AuthModels.errorMessage(r));
                            }
                        }

                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                            toast("Sin conexión: " + t.getMessage());
                        }
                    });
        });
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}