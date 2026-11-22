package com.example.fakewhatsapp;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.TaskStackBuilder;
import androidx.core.content.ContextCompat;

import com.bumptech.glide.Glide;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

public class Notificaciones {
    public static final String CANAL_MENSAJES = "mensajes";
    public static final String CANAL_GENERAL = "general";

    // Se llama una vez al iniciar la app (App.onCreate)
    public static void crearCanales(Context c) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationChannel mensajes = new NotificationChannel(
                CANAL_MENSAJES, "Mensajes", NotificationManager.IMPORTANCE_HIGH);
        mensajes.setDescription("Mensajes nuevos de tus chats");

        NotificationChannel general = new NotificationChannel(
                CANAL_GENERAL, "General", NotificationManager.IMPORTANCE_DEFAULT);
        general.setDescription("Avisos de la app");

        c.getSystemService(NotificationManager.class)
                .createNotificationChannels(Arrays.asList(mensajes, general));
    }

    // Una notificación por conversación (se reemplaza con cada mensaje nuevo)
    public static int idDe(String conversacionId) {
        return conversacionId.hashCode();
    }

    public static boolean tienePermiso(Context c) {
        return Build.VERSION.SDK_INT < 33
                || ContextCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
    }

    // Llamar desde un hilo de fondo (descarga el avatar)
    @SuppressLint("MissingPermission")
    public static void mostrarMensaje(Context c, String conversacionId, String nombre,
                                      String texto, String avatarUrl) {
        if (!tienePermiso(c)) return;

        // Al tocarla: lista de chats debajo y el chat encima (la flecha regresa a la lista)
        Intent main = new Intent(c, MainActivity.class);
        Intent chat = new Intent(c, ChatActivity.class)
                .putExtra("conversacion_id", conversacionId)
                .putExtra("nombre", nombre)
                .putExtra("avatar_url", avatarUrl);
        PendingIntent pi = TaskStackBuilder.create(c)
                .addNextIntent(main)
                .addNextIntent(chat)
                .getPendingIntent(idDe(conversacionId),
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CANAL_MENSAJES)
                .setSmallIcon(R.drawable.ic_notificacion)
                .setColor(0xFF075E54)
                .setContentTitle(nombre)
                .setContentText(texto)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(texto))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setAutoCancel(true)
                .setContentIntent(pi);

        Bitmap avatar = cargarAvatar(c, avatarUrl);
        if (avatar != null) b.setLargeIcon(avatar);

        NotificationManagerCompat.from(c).notify(idDe(conversacionId), b.build());
    }

    // Quita la notificación de un chat (al abrirlo)
    public static void cancelar(Context c, String conversacionId) {
        NotificationManagerCompat.from(c).cancel(idDe(conversacionId));
    }

    private static Bitmap cargarAvatar(Context c, String url) {
        if (url == null || url.isEmpty()) return null;
        try {
            return Glide.with(c.getApplicationContext())
                    .asBitmap().load(url).circleCrop()
                    .submit(128, 128)
                    .get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            return null;
        }
    }
}