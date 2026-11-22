package com.example.fakewhatsapp;

import java.util.List;
import java.util.Map;

import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.*;

public interface ChatApi {

    // ---------- Chats ----------

    @POST("rest/v1/rpc/mis_chats")
    Call<List<Chat>> misChats(@Body Map<String, Object> vacio);

    // Devuelve el id de la conversación privada (la crea si no existe)
    @POST("rest/v1/rpc/obtener_o_crear_chat")
    Call<String> obtenerOCrearChat(@Body Map<String, String> body);

    // Tipo y nombre de una conversación (id = "eq.<uuid>")
    @GET("rest/v1/conversaciones")
    Call<List<Conversacion>> conversacion(@Query("id") String id,
                                          @Query("select") String select);

    // Fase 11: {"nombre_grupo": "...", "miembros": ["uuid", ...]}
    @POST("rest/v1/rpc/crear_grupo")
    Call<String> crearGrupo(@Body Map<String, Object> body);

    // Fase 11: {"conv": "<uuid>"}
    @POST("rest/v1/rpc/miembros_de")
    Call<List<Miembro>> miembrosDe(@Body Map<String, String> body);

    // ---------- Mensajes ----------

    // Historial (conversacion_id = "eq.<uuid>")
    @GET("rest/v1/mensajes")
    Call<List<Mensaje>> historial(@Query("conversacion_id") String conversacionId,
                                  @Query("select") String select,
                                  @Query("order") String orden,
                                  @Query("limit") int limite);

    // Inserta y devuelve el mensaje creado (con id y fecha)
    @Headers("Prefer: return=representation")
    @POST("rest/v1/mensajes")
    Call<List<Mensaje>> enviar(@Body Mensaje mensaje);

    // Fase 11: {"mensaje": "<uuid>"}
    @POST("rest/v1/rpc/eliminar_mensaje")
    Call<Void> eliminarMensaje(@Body Map<String, String> body);

    // Fase 11: {"texto": "..."}
    @POST("rest/v1/rpc/buscar_mensajes")
    Call<List<ResultadoBusqueda>> buscarMensajes(@Body Map<String, String> body);

    // Fase 11: imágenes en el bucket privado "chat"
    @POST("storage/v1/object/chat/{path}")
    Call<ResponseBody> subirImagen(@Path(value = "path", encoded = true) String path,
                                   @Body RequestBody foto);

    @DELETE("storage/v1/object/chat/{path}")
    Call<ResponseBody> borrarImagen(@Path(value = "path", encoded = true) String path);

    // ---------- Estados (Fase 8) ----------

    @POST("rest/v1/rpc/ping")
    Call<Void> ping(@Body Map<String, Boolean> body);

    @POST("rest/v1/rpc/marcar_leidos")
    Call<Void> marcarLeidos(@Body Map<String, String> body);

    @POST("rest/v1/rpc/estado_chat")
    Call<List<EstadoChat>> estadoChat(@Body Map<String, String> body);

    // ---------- Notificaciones (Fase 9) ----------

    @POST("rest/v1/rpc/registrar_dispositivo")
    Call<Void> registrarDispositivo(@Body Map<String, String> body);

    @POST("rest/v1/rpc/eliminar_dispositivo")
    Call<Void> eliminarDispositivo(@Body Map<String, String> body);

    @POST("rest/v1/rpc/marcar_entregados")
    Call<Void> marcarEntregados(@Body Map<String, Object> vacio);
}