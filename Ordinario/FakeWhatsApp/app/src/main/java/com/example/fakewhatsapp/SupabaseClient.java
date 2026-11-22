package com.example.fakewhatsapp;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.Route;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class SupabaseClient {
    private static Retrofit retrofit;
    private static Retrofit plainRetrofit; // sin authenticator, solo para renovar el token
    private static OkHttpClient wsClient;  // para el WebSocket de Realtime

    public static synchronized Retrofit get() {
        if (retrofit == null) {
            retrofit = build(baseClient().authenticator(SupabaseClient::renovarToken).build());
        }
        return retrofit;
    }

    private static synchronized Retrofit plain() {
        if (plainRetrofit == null) plainRetrofit = build(baseClient().build());
        return plainRetrofit;
    }

    public static synchronized OkHttpClient websocketClient() {
        if (wsClient == null) {
            wsClient = new OkHttpClient.Builder()
                    .readTimeout(0, TimeUnit.MILLISECONDS)  // el socket queda abierto
                    .pingInterval(20, TimeUnit.SECONDS)     // detecta conexiones muertas
                    .build();
        }
        return wsClient;
    }

    private static Retrofit build(OkHttpClient client) {
        return new Retrofit.Builder()
                .baseUrl(BuildConfig.SUPABASE_URL + "/")
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
    }

    private static OkHttpClient.Builder baseClient() {
        HttpLoggingInterceptor log = new HttpLoggingInterceptor();
        // En release no se loguean tokens ni contraseñas
        log.setLevel(BuildConfig.DEBUG
                ? HttpLoggingInterceptor.Level.BODY
                : HttpLoggingInterceptor.Level.NONE);

        return new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    Request original = chain.request();
                    Request.Builder b = original.newBuilder()
                            .header("apikey", BuildConfig.SUPABASE_KEY);
                    if (original.header("Authorization") == null) {
                        String token = SessionManager.get().getAccessToken();
                        b.header("Authorization",
                                "Bearer " + (token != null ? token : BuildConfig.SUPABASE_KEY));
                    }
                    return chain.proceed(b.build());
                })
                .addInterceptor(log);
    }

    // Se ejecuta cuando el servidor responde 401 (JWT vencido)
    private static Request renovarToken(Route route, Response response) throws IOException {
        if (response.priorResponse() != null) return null; // ya se reintentó una vez

        synchronized (SupabaseClient.class) {
            SessionManager s = SessionManager.get();
            if (s.getRefreshToken() == null) return null;

            // Si otro hilo ya renovó el token, solo reintentamos con el nuevo
            String usado = response.request().header("Authorization");
            String actual = "Bearer " + s.getAccessToken();
            if (!actual.equals(usado)) {
                return response.request().newBuilder().header("Authorization", actual).build();
            }

            if (!refrescar()) return null;
            return response.request().newBuilder()
                    .header("Authorization", "Bearer " + s.getAccessToken()).build();
        }
    }

    // Renueva si al JWT le queda menos de 1 minuto. Llamar SOLO desde un hilo de fondo.
    public static void asegurarToken() {
        synchronized (SupabaseClient.class) {
            SessionManager s = SessionManager.get();
            if (s.getRefreshToken() == null) return;
            long ahora = System.currentTimeMillis() / 1000;
            if (s.getExpiresAt() - ahora > 60) return;
            try {
                refrescar();
            } catch (IOException ignored) {
                // sin conexión: se intentará en el siguiente latido
            }
        }
    }

    // Debe llamarse con el candado de SupabaseClient tomado
    private static boolean refrescar() throws IOException {
        SessionManager s = SessionManager.get();
        String refresh = s.getRefreshToken();
        if (refresh == null) return false;

        retrofit2.Response<AuthModels.AuthResponse> r = plain().create(AuthApi.class)
                .refresh(new AuthModels.RefreshRequest(refresh)).execute();

        if (r.isSuccessful() && r.body() != null) {
            s.save(r.body());
            return true;
        }
        s.clear(); // el refresh token ya no sirve: sesión terminada
        return false;
    }
}