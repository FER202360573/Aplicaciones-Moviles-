package com.example.fakewhatsapp;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import java.util.Collections;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class App extends Application {
    private int visibles = 0;
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable latido = new Runnable() {
        @Override
        public void run() {
            ping(true);
            handler.postDelayed(this, 30_000);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        SessionManager.init(this);
        Notificaciones.crearCanales(this); // Fase 9

        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
            @Override
            public void onActivityStarted(Activity a) {
                if (visibles++ == 0) {
                    handler.removeCallbacks(latido);
                    handler.post(latido); // la app pasó a primer plano
                }
            }

            @Override
            public void onActivityStopped(Activity a) {
                // Al girar la pantalla no cuenta como salir de la app
                if (--visibles == 0 && !a.isChangingConfigurations()) {
                    handler.removeCallbacks(latido);
                    ping(false); // la app pasó a segundo plano
                }
            }

            @Override public void onActivityCreated(Activity a, Bundle b) {}
            @Override public void onActivityResumed(Activity a) {}
            @Override public void onActivityPaused(Activity a) {}
            @Override public void onActivitySaveInstanceState(Activity a, Bundle b) {}
            @Override public void onActivityDestroyed(Activity a) {}
        });
    }

    // Actualiza última conexión y marca como recibidos los mensajes pendientes
    public static void ping(boolean activo) {
        if (!SessionManager.get().isLoggedIn()) return;
        SupabaseClient.get().create(ChatApi.class)
                .ping(Collections.singletonMap("activo", activo))
                .enqueue(new Callback<Void>() {
                    @Override public void onResponse(Call<Void> call, Response<Void> r) {}
                    @Override public void onFailure(Call<Void> call, Throwable t) {}
                });
    }
}