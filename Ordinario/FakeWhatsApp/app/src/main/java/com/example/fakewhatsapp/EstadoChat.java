package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;

// Resultado de la función estado_chat(conv)
public class EstadoChat {
    @SerializedName("otro_id")         public String otroId;
    @SerializedName("ultima_conexion") public String ultimaConexion;
    @SerializedName("en_linea")        public boolean enLinea;
}