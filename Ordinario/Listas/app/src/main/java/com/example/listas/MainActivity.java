package com.example.listas;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        RecyclerView recycler = findViewById(R.id.recyclerContactos);

        // Posicionamiento: lista vertical
        recycler.setLayoutManager(new LinearLayoutManager(this));

        // Datos de ejemplo
        List<Contacto> contactos = new ArrayList<>();
        contactos.add(new Contacto("Ana López", "229 111 2233"));
        contactos.add(new Contacto("Carlos Pérez", "229 444 5566"));
        contactos.add(new Contacto("María Gómez", "229 777 8899"));
        contactos.add(new Contacto("Luis Hernández", "229 123 4567"));
        contactos.add(new Contacto("Sofía Ramírez", "229 987 6543"));
        contactos.add(new Contacto("Jorge Torres", "229 321 0987"));
        contactos.add(new Contacto("Laura Díaz", "229 654 3210"));
        contactos.add(new Contacto("Pedro Castillo", "229 111 9999"));
        contactos.add(new Contacto("Valeria Cruz", "229 222 3344"));
        contactos.add(new Contacto("Diego Morales", "229 555 6677"));
        contactos.add(new Contacto("Fernanda Ortiz", "229 888 9900"));
        contactos.add(new Contacto("Ricardo Vargas", "229 101 2020"));
        contactos.add(new Contacto("Daniela Flores", "229 303 4040"));
        contactos.add(new Contacto("Miguel Ángel Ruiz", "229 505 6060"));
        contactos.add(new Contacto("Paola Mendoza", "229 707 8080"));
        contactos.add(new Contacto("Andrés Navarro", "229 909 1010"));
        contactos.add(new Contacto("Gabriela Silva", "229 121 3434"));
        contactos.add(new Contacto("Héctor Rojas", "229 565 7878"));
        contactos.add(new Contacto("Isabel Medina", "229 989 0101"));
        contactos.add(new Contacto("Tomás Aguilar", "229 232 4545"));

        // Conecta el adapter
        recycler.setAdapter(new ContactoAdapter(contactos));
    }
}