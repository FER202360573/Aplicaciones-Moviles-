package com.example.demointent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class ActivityTres extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tres);

        String nombre = getIntent().getStringExtra("nombre");
        String edad = getIntent().getStringExtra("edad");
        TextView tv = findViewById(R.id.tvDatos);
        tv.setText( nombre + " tiene " + edad + " años");

        Button btnRegresar = findViewById(R.id.btnRegresar);
        btnRegresar.setOnClickListener(v -> finish());
    }
}