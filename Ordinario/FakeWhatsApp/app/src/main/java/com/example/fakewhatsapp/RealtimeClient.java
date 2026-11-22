package com.example.fakewhatsapp;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class RealtimeClient {
    private static final String TAG = "Realtime";

    // Los eventos llegan en el hilo principal
    public interface Listener {
        default void onConectado() {}
        default void onInsert(JSONObject record) {}
        default void onUpdate(JSONObject record) {}
        default void onBroadcast(String evento, JSONObject payload) {}
    }

    private final String topic;
    private final JSONArray cambios;
    private final Listener listener;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ScheduledExecutorService exec = Executors.newSingleThreadScheduledExecutor();

    // Estas variables solo se usan desde el hilo "exec"
    private WebSocket ws;
    private String joinRef;
    private String tokenEnviado;
    private boolean activo = false;
    private boolean unido = false;
    private int ref = 0;
    private int intentos = 0;

    public RealtimeClient(String canal, JSONArray cambios, Listener listener) {
        this.topic = "realtime:" + canal;
        this.cambios = cambios;
        this.listener = listener;
        exec.scheduleWithFixedDelay(this::latido, 25, 25, TimeUnit.SECONDS);
    }

    // Arma un filtro de postgres_changes. filtro puede ser null (sin filtro)
    public static JSONObject cambio(String evento, String tabla, String filtro) {
        try {
            JSONObject o = new JSONObject()
                    .put("event", evento)
                    .put("schema", "public")
                    .put("table", tabla);
            if (filtro != null) o.put("filter", filtro);
            return o;
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public void conectar() {
        correr(() -> {
            if (activo) return;
            activo = true;
            intentos = 0;
            abrir();
        });
    }

    public void desconectar() {
        correr(() -> {
            activo = false;
            unido = false;
            if (ws != null) ws.close(1000, null);
            ws = null;
        });
    }

    // Llamar en onDestroy
    public void cerrar() {
        desconectar();
        exec.shutdown();
    }

    // Mensaje efímero (no se guarda en la base), ej. "escribiendo"
    public void broadcast(String evento, JSONObject payload) {
        correr(() -> {
            if (!unido) return;
            try {
                enviar(topic, "broadcast", new JSONObject()
                        .put("type", "broadcast")
                        .put("event", evento)
                        .put("payload", payload));
            } catch (JSONException ignored) {}
        });
    }

    // ---------- Internos (hilo exec) ----------

    private void correr(Runnable r) {
        try {
            exec.execute(r);
        } catch (RejectedExecutionException ignored) {
            // ya se cerró
        }
    }

    private void abrir() {
        if (!activo || ws != null || exec.isShutdown()) return;
        SupabaseClient.asegurarToken(); // que el JWT no esté por vencer
        if (SessionManager.get().getAccessToken() == null) return;

        String url = BuildConfig.SUPABASE_URL.replace("https://", "wss://")
                + "/realtime/v1/websocket?apikey=" + BuildConfig.SUPABASE_KEY + "&vsn=1.0.0";

        ws = SupabaseClient.websocketClient().newWebSocket(
                new Request.Builder().url(url).build(),
                new WebSocketListener() {
                    @Override
                    public void onOpen(WebSocket s, Response r) {
                        correr(() -> { if (s == ws) unirse(); });
                    }

                    @Override
                    public void onMessage(WebSocket s, String text) {
                        correr(() -> { if (s == ws) procesar(text); });
                    }

                    @Override
                    public void onClosed(WebSocket s, int code, String reason) {
                        correr(() -> caido(s));
                    }

                    @Override
                    public void onFailure(WebSocket s, Throwable t, Response r) {
                        Log.w(TAG, "Conexión fallida: " + t.getMessage());
                        correr(() -> caido(s));
                    }
                });
    }

    private void unirse() {
        try {
            String token = SessionManager.get().getAccessToken();
            JSONObject config = new JSONObject()
                    .put("broadcast", new JSONObject().put("self", false).put("ack", false))
                    .put("presence", new JSONObject().put("key", ""))
                    .put("postgres_changes", cambios)
                    .put("private", true);

            joinRef = String.valueOf(ref + 1); // el ref del join es también el join_ref
            enviar(topic, "phx_join", new JSONObject()
                    .put("config", config)
                    .put("access_token", token));
            tokenEnviado = token;
        } catch (JSONException e) {
            Log.w(TAG, "No se pudo armar el join", e);
        }
    }

    private void procesar(String text) {
        try {
            JSONObject m = new JSONObject(text);
            if (!topic.equals(m.optString("topic"))) return; // respuestas del heartbeat

            String evento = m.optString("event");
            JSONObject payload = m.optJSONObject("payload");
            if (payload == null) payload = new JSONObject();

            switch (evento) {
                case "phx_reply":
                    if (joinRef != null && joinRef.equals(m.optString("ref"))) {
                        if ("ok".equals(payload.optString("status"))) {
                            unido = true;
                            intentos = 0;
                            main.post(listener::onConectado);
                        } else {
                            Log.w(TAG, "Join rechazado: " + payload);
                            reiniciar();
                        }
                    }
                    break;

                case "postgres_changes":
                    JSONObject data = payload.optJSONObject("data");
                    if (data == null) break;
                    JSONObject record = data.optJSONObject("record");
                    if (record == null) break;
                    String tipo = data.optString("type");
                    if ("INSERT".equals(tipo)) main.post(() -> listener.onInsert(record));
                    else if ("UPDATE".equals(tipo)) main.post(() -> listener.onUpdate(record));
                    break;

                case "broadcast":
                    String ev = payload.optString("event");
                    JSONObject p = payload.optJSONObject("payload");
                    JSONObject datos = p != null ? p : new JSONObject();
                    main.post(() -> listener.onBroadcast(ev, datos));
                    break;

                case "system":
                    if ("error".equals(payload.optString("status"))) {
                        Log.w(TAG, "Error del servidor: " + payload);
                        reiniciar();
                    }
                    break;

                case "phx_error":
                case "phx_close":
                    reiniciar();
                    break;
            }
        } catch (JSONException e) {
            Log.w(TAG, "Mensaje inválido", e);
        }
    }

    private String enviar(String t, String evento, JSONObject payload) throws JSONException {
        String r = String.valueOf(++ref);
        JSONObject m = new JSONObject()
                .put("topic", t)
                .put("event", evento)
                .put("payload", payload)
                .put("ref", r);
        if (joinRef != null && !"phoenix".equals(t)) m.put("join_ref", joinRef);
        if (ws != null) ws.send(m.toString());
        return r;
    }

    // Cada 25 s: heartbeat y, si el JWT se renovó, se le pasa a Realtime
    private void latido() {
        try {
            if (ws == null) return;
            enviar("phoenix", "heartbeat", new JSONObject());
            if (unido) {
                SupabaseClient.asegurarToken();
                String token = SessionManager.get().getAccessToken();
                if (token != null && !token.equals(tokenEnviado)) {
                    enviar(topic, "access_token", new JSONObject().put("access_token", token));
                    tokenEnviado = token;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error en el latido", e);
        }
    }

    private void reiniciar() {
        if (ws == null) return;
        WebSocket viejo = ws;
        viejo.cancel();
        caido(viejo);
    }

    // Reintenta con espera creciente: 1, 2, 4, 8, 16, 30 s
    private void caido(WebSocket s) {
        if (s == null || s != ws) return;
        ws = null;
        unido = false;
        if (!activo || exec.isShutdown()) return;
        long espera = Math.min(30, 1L << Math.min(intentos, 5));
        intentos++;
        exec.schedule(this::abrir, espera, TimeUnit.SECONDS);
    }
}