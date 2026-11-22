package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;

// Resultado de miembros_de(conv)
public class Miembro {
    @SerializedName("perfil_id")  public String perfilId;
    public String nombre;
    @SerializedName("avatar_url") public String avatarUrl;
    public String rol;
}