package com.example.calculadoradesumas;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    EditText editTextNumber1, editTextNumber2;
    Button button;
    TextView textView3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        editTextNumber1 = findViewById(R.id.editTextNumber1);
        editTextNumber2 = findViewById(R.id.editTextNumber2);
        button = findViewById(R.id.button);
        textView3 = findViewById(R.id.textView3);

        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String n1 = editTextNumber1.getText().toString();
                String n2 = editTextNumber2.getText().toString();

                if (n1.isEmpty() || n2.isEmpty()) {
                    textView3.setText(R.string.ingresa_numeros);
                    return;
                }

                int suma = Integer.parseInt(n1) + Integer.parseInt(n2);
                textView3.setText(getString(R.string.respuesta) + ": " + suma);
            }
        });
    }
}