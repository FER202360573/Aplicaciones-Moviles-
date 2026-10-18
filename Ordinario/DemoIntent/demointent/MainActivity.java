package com.example.demointent;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        EditText etNombre = findViewById(R.id.etNombre);
        EditText etEdad = findViewById(R.id.etEdad);
        EditText Genero = findViewById(R.id.Genero);
        Button btnUno = findViewById(R.id.btnUno);
        Button btnDos = findViewById(R.id.btnDos);
        Button btnTres = findViewById(R.id.btnTres);
        Button btnCuatro = findViewById(R.id.btnCuatro);

        btnUno.setOnClickListener(v -> {
            Intent intent = new Intent(this, ActivityUno.class);
            intent.putExtra("nombre", etNombre.getText().toString());
            startActivity(intent);
        });

        btnDos.setOnClickListener(v -> {
            Intent intent = new Intent(this, ActivityDos.class);
            intent.putExtra("edad", etEdad.getText().toString());
            startActivity(intent);
        });

        btnTres.setOnClickListener(v -> {
            Intent intent = new Intent(this, ActivityTres.class);
            intent.putExtra("nombre", etNombre.getText().toString());
            intent.putExtra("edad", etEdad.getText().toString());
            startActivity(intent);
        });

        btnCuatro.setOnClickListener(v -> {
            Intent intent = new Intent(this, ActivityCuatro.class);
            intent.putExtra("genero", Genero.getText().toString());
            startActivity(intent);
        });
    }
}