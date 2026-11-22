package com.example.fakewhatsapp;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static SessionManager instance;
    private final SharedPreferences prefs;

    private SessionManager(Context c) {
        prefs = c.getSharedPreferences("session", Context.MODE_PRIVATE);
    }

    public static void init(Context c) { instance = new SessionManager(c.getApplicationContext()); }
    public static SessionManager get() { return instance; }

    public void save(AuthModels.AuthResponse r) {
        prefs.edit()
                .putString("access_token", r.accessToken)
                .putString("refresh_token", r.refreshToken)
                .putLong("expires_at", r.expiresAt)
                .putString("user_id", r.user != null ? r.user.id : null)
                .putString("email", r.user != null ? r.user.email : null)
                .apply();
    }

    public String getAccessToken()  { return prefs.getString("access_token", null); }
    public String getRefreshToken() { return prefs.getString("refresh_token", null); }
    public long getExpiresAt()      { return prefs.getLong("expires_at", 0); } // segundos epoch
    public String getUserId()       { return prefs.getString("user_id", null); }
    public String getEmail()        { return prefs.getString("email", null); }
    public boolean isLoggedIn()     { return getRefreshToken() != null; }
    public void clear()             { prefs.edit().clear().apply(); }
}