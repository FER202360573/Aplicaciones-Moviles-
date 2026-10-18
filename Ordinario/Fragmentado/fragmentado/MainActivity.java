package com.example.fragmentado;

import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button btnUno = findViewById(R.id.btnUno);
        Button btnDos = findViewById(R.id.btnDos);
        Button btnTres = findViewById(R.id.btnTres);

        // Mostrar el primer fragmento al abrir la app
        if (savedInstanceState == null) {
            mostrarFragmento(new FragmentoUno());
        }

        btnUno.setOnClickListener(v -> mostrarFragmento(new FragmentoUno()));
        btnDos.setOnClickListener(v -> mostrarFragmento(new FragmentoDos()));
        btnTres.setOnClickListener(v -> mostrarFragmento(new FragmentoTres()));
    }

    private void mostrarFragmento(Fragment fragmento) {
        getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.contenedor, fragmento)
                .commit();
    }
}