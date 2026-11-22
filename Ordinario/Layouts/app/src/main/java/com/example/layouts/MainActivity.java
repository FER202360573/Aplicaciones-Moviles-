package com.example.layouts;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button btnLinear = findViewById(R.id.btnLinear);
        Button btnRelative = findViewById(R.id.btnRelative);
        Button btnFrame = findViewById(R.id.btnFrame);
        Button btnTable = findViewById(R.id.btnTable);

        btnLinear.setOnClickListener(v ->
                startActivity(new Intent(this, LienarLayout.class)));
        btnRelative.setOnClickListener(v ->
                startActivity(new Intent(this, RelativeLayout.class)));
        btnFrame.setOnClickListener(v ->
                startActivity(new Intent(this, FrameLayout.class)));
        btnTable.setOnClickListener(v ->
                startActivity(new Intent(this, TableLayout.class)));
    }
}