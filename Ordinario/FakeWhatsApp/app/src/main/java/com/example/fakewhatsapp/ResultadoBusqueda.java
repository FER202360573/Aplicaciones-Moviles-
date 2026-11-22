package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;

// Resultado de buscar_mensajes(texto)
public class ResultadoBusqueda {
    @SerializedName("mensaje_id")       public String mensajeId;
    @SerializedName("conversacion_id")  public String conversacionId;
    @SerializedName("conv_tipo")        public String convTipo;
    public String titulo;
    public String foto;
    @SerializedName("remitente_id")     public String remitenteId;
    @SerializedName("remitente_nombre") public String remitenteNombre;
    public String contenido;
    @SerializedName("creado_en")        public String creadoEn;
}