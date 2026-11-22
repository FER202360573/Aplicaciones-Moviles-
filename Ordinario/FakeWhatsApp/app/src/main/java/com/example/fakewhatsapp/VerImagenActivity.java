package com.example.fakewhatsapp;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;

public class VerImagenActivity extends AppCompatActivity {

    // deChat = true: ruta del bucket privado "chat"; false: URL pública (avatar)
    public static void abrir(Context c, String url, boolean deChat) {
        if (url == null || url.isEmpty()) return;
        c.startActivity(new Intent(c, VerImagenActivity.class)
                .putExtra("url", url)
                .putExtra("de_chat", deChat));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ver_imagen);
        if (getSupportActionBar() != null) getSupportActionBar().hide();

        String url = getIntent().getStringExtra("url");
        if (url == null) {
            finish();
            return;
        }

        ImageView iv = findViewById(R.id.ivImagen);
        if (getIntent().getBooleanExtra("de_chat", false)) {
            Glide.with(this).load(Imagenes.urlChat(url)).into(iv);
        } else {
            Glide.with(this).load(url).into(iv);
        }
        iv.setOnClickListener(v -> finish());
    }
}