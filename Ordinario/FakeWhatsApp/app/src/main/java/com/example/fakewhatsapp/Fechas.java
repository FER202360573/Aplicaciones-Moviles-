package com.example.fakewhatsapp;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class Fechas {

    // "2026-11-18T19:58:12.123456+00:00" -> Date (Supabase manda UTC)
    private static Date parse(String iso) {
        if (iso == null || iso.length() < 19) return null;
        try {
            SimpleDateFormat f = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
            f.setTimeZone(TimeZone.getTimeZone("UTC"));
            return f.parse(iso.substring(0, 19));
        } catch (ParseException e) {
            return null;
        }
    }

    private static boolean mismoDia(Calendar a, Calendar b) {
        return a.get(Calendar.YEAR) == b.get(Calendar.YEAR)
                && a.get(Calendar.DAY_OF_YEAR) == b.get(Calendar.DAY_OF_YEAR);
    }

    private static String formato(Date d, String patron) {
        return new SimpleDateFormat(patron, Locale.getDefault()).format(d);
    }

    // Hora local para las burbujas: "14:05"
    public static String hora(String iso) {
        Date d = parse(iso);
        return d == null ? "" : formato(d, "HH:mm");
    }

    // Para la lista de chats: hora si es de hoy, fecha si no
    public static String corta(String iso) {
        Date d = parse(iso);
        if (d == null) return "";
        Calendar c = Calendar.getInstance();
        c.setTime(d);
        return formato(d, mismoDia(c, Calendar.getInstance()) ? "HH:mm" : "dd/MM/yy");
    }

    // "hoy a las 14:05", "ayer a las 09:30", "el 15/11/26 a las 18:00"
    public static String ultimaVez(String iso) {
        Date d = parse(iso);
        if (d == null) return "";
        Calendar c = Calendar.getInstance();
        c.setTime(d);
        Calendar hoy = Calendar.getInstance();
        Calendar ayer = Calendar.getInstance();
        ayer.add(Calendar.DAY_OF_YEAR, -1);

        String hora = formato(d, "HH:mm");
        if (mismoDia(c, hoy)) return "hoy a las " + hora;
        if (mismoDia(c, ayer)) return "ayer a las " + hora;
        return "el " + formato(d, "dd/MM/yy") + " a las " + hora;
    }
}