package com.example.verthorizon;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "CICLO_VIDA";
    private static final String KEY_DATO = "dato_capturado";

    private EditText etDato;
    private TextView tvResultado;
    private Button btnMostrar;

    private String datoCapturado = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etDato = findViewById(R.id.etDato);
        tvResultado = findViewById(R.id.tvResultado);
        btnMostrar = findViewById(R.id.btnMostrar);

        // Restaurar el dato si la Activity fue recreada
        if (savedInstanceState != null) {
            datoCapturado = savedInstanceState.getString(KEY_DATO, "");
            if (!datoCapturado.isEmpty()) {
                tvResultado.setText("Dato capturado: " + datoCapturado);
            }
        }

        btnMostrar.setOnClickListener(v -> {
            datoCapturado = etDato.getText().toString();
            tvResultado.setText("Dato capturado: " + datoCapturado);
        });

        avisar("onCreate");
    }

    @Override
    protected void onPause() {
        super.onPause();
        avisar("onPause");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        avisar("onDestroy");
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString(KEY_DATO, datoCapturado);
    }

    private void avisar(String metodo) {
        Log.d(TAG, metodo + " ejecutado");
        Toast.makeText(this, metodo, Toast.LENGTH_SHORT).show();
    }
}