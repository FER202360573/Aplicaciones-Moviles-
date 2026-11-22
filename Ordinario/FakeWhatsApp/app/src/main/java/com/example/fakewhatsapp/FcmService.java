package com.example.fakewhatsapp;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Collections;
import java.util.Map;

public class FcmService extends FirebaseMessagingService {

    // Firebase genera un token nuevo (primera vez, reinstalación, etc.)
    @Override
    public void onNewToken(@NonNull String token) {
        FcmHelper.registrarToken(token);
    }

    // Corre en un hilo de fondo, aunque la app esté cerrada
    @Override
    public void onMessageReceived(@NonNull RemoteMessage msg) {
        Map<String, String> d = msg.getData();
        if (!"mensaje".equals(d.get("tipo"))) return;
        if (!SessionManager.get().isLoggedIn()) return;

        // Fase 8: marcar como RECIBIDO (✓✓ gris) aunque la app esté cerrada
        try {
            SupabaseClient.get().create(ChatApi.class)
                    .marcarEntregados(Collections.emptyMap())
                    .execute();
        } catch (Exception ignored) {}

        String conv = d.get("conversacion_id");
        if (conv == null) return;
        if (conv.equals(ChatActivity.conversacionVisible)) return; // ya lo está viendo

        Notificaciones.mostrarMensaje(this, conv,
                d.get("nombre"), d.get("texto"), d.get("avatar_url"));
    }
}