package com.example.fakewhatsapp;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;

import com.bumptech.glide.load.model.GlideUrl;
import com.bumptech.glide.load.model.LazyHeaders;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class Imagenes {

    // Reduce la foto a máx. "maxLado" px y la comprime a JPEG
    public static byte[] comprimir(Context c, Uri uri, int maxLado) throws IOException {
        BitmapFactory.Options o = new BitmapFactory.Options();
        o.inJustDecodeBounds = true;
        try (InputStream in = c.getContentResolver().openInputStream(uri)) {
            BitmapFactory.decodeStream(in, null, o);
        }
        int max = Math.max(o.outWidth, o.outHeight);
        int sample = 1;
        while (max / sample > maxLado) sample *= 2;

        o = new BitmapFactory.Options();
        o.inSampleSize = sample;
        Bitmap bmp;
        try (InputStream in = c.getContentResolver().openInputStream(uri)) {
            bmp = BitmapFactory.decodeStream(in, null, o);
        }
        if (bmp == null) throw new IOException("Imagen inválida");

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        bmp.compress(Bitmap.CompressFormat.JPEG, 80, out);
        return out.toByteArray();
    }

    // El bucket "chat" es privado: Glide manda el JWT del usuario.
    // La caché de Glide usa solo la URL, así que un token nuevo no la invalida.
    public static GlideUrl urlChat(String ruta) {
        String token = SessionManager.get().getAccessToken();
        return new GlideUrl(
                BuildConfig.SUPABASE_URL + "/storage/v1/object/authenticated/chat/" + ruta,
                new LazyHeaders.Builder()
                        .addHeader("apikey", BuildConfig.SUPABASE_KEY)
                        .addHeader("Authorization", "Bearer " + (token != null ? token : ""))
                        .build());
    }
}