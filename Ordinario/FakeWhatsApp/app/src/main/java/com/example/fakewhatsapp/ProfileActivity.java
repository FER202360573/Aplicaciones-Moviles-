package com.example.fakewhatsapp;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {
    private ImageView ivAvatar;
    private EditText etNombre;
    private Button btnGuardar;
    private PerfilApi api;
    private byte[] fotoBytes; // foto nueva elegida, pendiente de subir
    private final String userId = SessionManager.get().getUserId();

    // Selector de fotos del sistema: no necesita permisos
    private final ActivityResultLauncher<PickVisualMediaRequest> picker =
            registerForActivityResult(new ActivityResultContracts.PickVisualMedia(), uri -> {
                if (uri != null) procesarImagen(uri);
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);
        api = SupabaseClient.get().create(PerfilApi.class);

        ivAvatar = findViewById(R.id.ivAvatar);
        etNombre = findViewById(R.id.etNombre);
        btnGuardar = findViewById(R.id.btnGuardar);

        ivAvatar.setOnClickListener(v -> picker.launch(new PickVisualMediaRequest.Builder()
                .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
                .build()));
        btnGuardar.setOnClickListener(v -> guardar());

        cargarPerfil();
    }

    private void cargarPerfil() {
        api.obtener("eq." + userId, "*").enqueue(new Callback<List<Perfil>>() {
            @Override
            public void onResponse(Call<List<Perfil>> call, Response<List<Perfil>> r) {
                if (r.isSuccessful() && r.body() != null && !r.body().isEmpty()) {
                    Perfil p = r.body().get(0);
                    etNombre.setText(p.nombre);
                    Glide.with(ProfileActivity.this).load(p.avatarUrl)
                            .placeholder(R.drawable.ic_person)
                            .fallback(R.drawable.ic_person)
                            .circleCrop().into(ivAvatar);
                }
            }

            @Override
            public void onFailure(Call<List<Perfil>> call, Throwable t) {
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    // Reduce la foto a máx. ~1024 px y la comprime a JPEG antes de subirla
    private void procesarImagen(Uri uri) {
        try {
            BitmapFactory.Options o = new BitmapFactory.Options();
            o.inJustDecodeBounds = true;
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                BitmapFactory.decodeStream(in, null, o);
            }
            int max = Math.max(o.outWidth, o.outHeight);
            int sample = 1;
            while (max / sample > 1024) sample *= 2;

            o = new BitmapFactory.Options();
            o.inSampleSize = sample;
            Bitmap bmp;
            try (InputStream in = getContentResolver().openInputStream(uri)) {
                bmp = BitmapFactory.decodeStream(in, null, o);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.JPEG, 80, out);
            fotoBytes = out.toByteArray();

            Glide.with(this).load(fotoBytes).circleCrop().into(ivAvatar);
        } catch (Exception e) {
            toast("No se pudo leer la imagen");
        }
    }

    private void guardar() {
        String nombre = etNombre.getText().toString().trim();
        if (nombre.isEmpty()) {
            toast("Escribe tu nombre");
            return;
        }
        btnGuardar.setEnabled(false);
        if (fotoBytes != null) subirFoto(nombre);
        else actualizar(nombre, null);
    }

    private void subirFoto(String nombre) {
        String path = userId + "/avatar.jpg";
        RequestBody body = RequestBody.create(fotoBytes, MediaType.parse("image/jpeg"));

        api.subirAvatar(path, "true", body).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> r) {
                if (r.isSuccessful()) {
                    // ?v= evita que Glide muestre la foto anterior en caché
                    String url = BuildConfig.SUPABASE_URL
                            + "/storage/v1/object/public/avatars/" + path
                            + "?v=" + System.currentTimeMillis();
                    actualizar(nombre, url);
                } else {
                    btnGuardar.setEnabled(true);
                    toast("No se pudo subir la foto (" + r.code() + ")");
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                btnGuardar.setEnabled(true);
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    private void actualizar(String nombre, String avatarUrl) {
        Map<String, String> campos = new HashMap<>();
        campos.put("nombre", nombre);
        if (avatarUrl != null) campos.put("avatar_url", avatarUrl);

        api.actualizar("eq." + userId, campos).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> r) {
                btnGuardar.setEnabled(true);
                if (r.isSuccessful()) {
                    toast("Perfil actualizado");
                    finish();
                } else {
                    toast(AuthModels.errorMessage(r));
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                btnGuardar.setEnabled(true);
                toast("Sin conexión: " + t.getMessage());
            }
        });
    }

    private void toast(String m) { Toast.makeText(this, m, Toast.LENGTH_LONG).show(); }
}