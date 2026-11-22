package com.example.fakewhatsapp;

import android.util.Log;

import com.google.firebase.messaging.FirebaseMessaging;

import java.util.Collections;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FcmHelper {
    private static final String TAG = "FCM";

    // Obtener FCM Token y registrarlo (llamar después de iniciar sesión)
    public static void registrar() {
        try {
            FirebaseMessaging.getInstance().getToken()
                    .addOnSuccessListener(FcmHelper::registrarToken)
                    .addOnFailureListener(e -> Log.w(TAG, "No se pudo obtener el token", e));
        } catch (Exception e) {
            // Firebase no está inicializado (falta google-services.json o el plugin)
            Log.e(TAG, "Firebase no disponible", e);
        }
    }

    // Registrar Token en Supabase (tabla dispositivos)
    public static void registrarToken(String token) {
        if (token == null || !SessionManager.get().isLoggedIn()) return;
        if (BuildConfig.DEBUG) Log.d(TAG, "Token: " + token);

        SupabaseClient.get().create(ChatApi.class)
                .registrarDispositivo(Collections.singletonMap("token", token))
                .enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> r) {
                        if (r.isSuccessful()) Log.d(TAG, "Token registrado en Supabase");
                        else Log.w(TAG, "Error al registrar token: " + AuthModels.errorMessage(r));
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        Log.w(TAG, "Sin conexión al registrar token", t);
                    }
                });
    }

    // Al cerrar sesión: este celular deja de recibir notificaciones de esa cuenta
    public static void eliminar(Runnable despues) {
        try {
            FirebaseMessaging.getInstance().getToken()
                    .addOnSuccessListener(token -> SupabaseClient.get().create(ChatApi.class)
                            .eliminarDispositivo(Collections.singletonMap("token", token))
                            .enqueue(new Callback<Void>() {
                                @Override
                                public void onResponse(Call<Void> call, Response<Void> r) { despues.run(); }

                                @Override
                                public void onFailure(Call<Void> call, Throwable t) { despues.run(); }
                            }))
                    .addOnFailureListener(e -> despues.run());
        } catch (Exception e) {
            Log.e(TAG, "Firebase no disponible", e);
            despues.run();
        }
    }
}