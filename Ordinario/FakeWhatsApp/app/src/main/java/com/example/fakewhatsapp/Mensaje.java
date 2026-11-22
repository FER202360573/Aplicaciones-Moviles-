package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;

public class Mensaje {
    public String id;
    @SerializedName("conversacion_id") public String conversacionId;
    @SerializedName("remitente_id")    public String remitenteId;
    public String contenido;           // texto, o la ruta en Storage si es imagen
    public String tipo;                // "texto" o "imagen"
    @SerializedName("creado_en")       public String creadoEn;
    @SerializedName("entregado_en")    public String entregadoEn; // Recibido
    @SerializedName("leido_en")        public String leidoEn;     // Leído
    public boolean eliminado;

    public Mensaje() {}

    // Mensaje de texto. Gson no manda los campos null (los demás los pone Postgres)
    public Mensaje(String conversacionId, String remitenteId, String contenido) {
        this(conversacionId, remitenteId, contenido, "texto");
    }

    public Mensaje(String conversacionId, String remitenteId, String contenido, String tipo) {
        this.conversacionId = conversacionId;
        this.remitenteId = remitenteId;
        this.contenido = contenido;
        this.tipo = tipo;
    }

    public boolean esImagen() { return "imagen".equals(tipo) && !eliminado; }
}