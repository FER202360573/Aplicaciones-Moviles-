package com.example.fakewhatsapp;

import com.google.gson.annotations.SerializedName;
import org.json.JSONObject;
import java.util.Map;
import retrofit2.Response;

public class AuthModels {

    public static class SignUpRequest {
        String email, password;
        Map<String, String> data; // metadatos: el trigger lee "nombre"
        public SignUpRequest(String email, String password, Map<String, String> data) {
            this.email = email; this.password = password; this.data = data;
        }
    }

    public static class LoginRequest {
        String email, password;
        public LoginRequest(String email, String password) {
            this.email = email; this.password = password;
        }
    }

    public static class RefreshRequest {
        @SerializedName("refresh_token") String refreshToken;
        public RefreshRequest(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class RecoverRequest {
        String email;
        public RecoverRequest(String email) { this.email = email; }
    }

    public static class UpdatePasswordRequest {
        String password;
        public UpdatePasswordRequest(String password) { this.password = password; }
    }

    public static class User {
        public String id;
        public String email;
    }

    public static class AuthResponse {
        @SerializedName("access_token")  public String accessToken;
        @SerializedName("refresh_token") public String refreshToken;
        @SerializedName("expires_at")    public long expiresAt;
        public User user;
    }

    // Extrae el mensaje de error que devuelve Supabase
    public static String errorMessage(Response<?> r) {
        try {
            if (r.errorBody() != null) {
                JSONObject o = new JSONObject(r.errorBody().string());
                for (String k : new String[]{"msg", "error_description", "message"}) {
                    if (o.has(k)) return o.getString(k);
                }
            }
        } catch (Exception ignored) {}
        return "Error " + r.code();
    }
}