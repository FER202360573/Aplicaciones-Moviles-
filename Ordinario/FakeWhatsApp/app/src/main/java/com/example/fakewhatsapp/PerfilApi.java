package com.example.fakewhatsapp;

import java.util.List;
import java.util.Map;

import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.*;

public interface PerfilApi {

    // Un perfil por id (id = "eq.<uuid>")
    @GET("rest/v1/perfiles")
    Call<List<Perfil>> obtener(@Query("id") String id,
                               @Query("select") String select);

    // Lista de usuarios. Los parámetros null no se envían.
    @GET("rest/v1/perfiles")
    Call<List<Perfil>> listar(@Query("select") String select,
                              @Query("id") String excluirId,
                              @Query("nombre") String filtroNombre,
                              @Query("order") String orden,
                              @Query("limit") int limite);

    @PATCH("rest/v1/perfiles")
    Call<Void> actualizar(@Query("id") String id,
                          @Body Map<String, String> campos);

    @POST("storage/v1/object/avatars/{path}")
    Call<ResponseBody> subirAvatar(@Path(value = "path", encoded = true) String path,
                                   @Header("x-upsert") String upsert,
                                   @Body RequestBody foto);
}