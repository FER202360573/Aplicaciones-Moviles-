package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;

// Una fila de la función mis_chats() (chats privados y grupos)
public class Chat {
    @SerializedName("conversacion_id")         public String conversacionId;
    public String tipo;   // "privada" o "grupo"
    public String titulo; // nombre del otro o nombre del grupo
    public String foto;   // avatar del otro (null en grupos)
    @SerializedName("otro_id")                 public String otroId;
    @SerializedName("ultimo_mensaje")          public String ultimoMensaje;
    @SerializedName("ultimo_tipo")             public String ultimoTipo;
    @SerializedName("ultimo_remitente")        public String ultimoRemitente;
    @SerializedName("ultimo_remitente_nombre") public String ultimoRemitenteNombre;
    @SerializedName("ultimo_eliminado")        public Boolean ultimoEliminado;
    @SerializedName("ultima_fecha")            public String ultimaFecha;

    public boolean esGrupo() { return "grupo".equals(tipo); }
}