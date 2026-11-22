package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;

public class Perfil {
    public String id;
    public String nombre;
    public String telefono;
    @SerializedName("avatar_url") public String avatarUrl;
    public String estado;
}