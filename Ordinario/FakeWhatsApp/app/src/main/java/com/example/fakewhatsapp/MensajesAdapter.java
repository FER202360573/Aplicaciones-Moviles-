package com.example.fakewhatsapp;

import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MensajesAdapter extends RecyclerView.Adapter<MensajesAdapter.VH> {

    public interface Acciones {
        void onLongClick(Mensaje m);
        void onImagenClick(Mensaje m);
    }

    private static final int ENVIADO = 1;
    private static final int RECIBIDO = 2;
    private static final int GRIS = 0xFF8C8C8C;
    private static final int AZUL = 0xFF34B7F1;
    private static final int NEGRO = 0xFF000000;

    private final List<Mensaje> items = new ArrayList<>();
    private final Map<String, String> nombres = new HashMap<>(); // perfil_id -> nombre
    private final String miId;
    private final Acciones acciones;
    private boolean esGrupo = false;

    public MensajesAdapter(String miId, Acciones acciones) {
        this.miId = miId;
        this.acciones = acciones;
    }

    public void setEsGrupo(boolean esGrupo) {
        this.esGrupo = esGrupo;
        notifyDataSetChanged();
    }

    public void setNombres(Map<String, String> nuevos) {
        nombres.clear();
        nombres.putAll(nuevos);
        notifyDataSetChanged();
    }

    public void setItems(List<Mensaje> nuevos) {
        items.clear();
        items.addAll(nuevos);
        notifyDataSetChanged();
    }

    // Agrega al final sin duplicar. Devuelve false si ya estaba.
    public boolean agregar(Mensaje m) {
        if (indiceDe(m.id) >= 0) return false;
        items.add(m);
        notifyItemInserted(items.size() - 1);
        return true;
    }

    // Reemplaza un mensaje existente (cambio de estado o eliminado)
    public void actualizar(Mensaje m) {
        int i = indiceDe(m.id);
        if (i < 0) return;
        items.set(i, m);
        notifyItemChanged(i);
    }

    public int indiceDe(String id) {
        if (id == null) return -1;
        for (int i = 0; i < items.size(); i++) {
            if (id.equals(items.get(i).id)) return i;
        }
        return -1;
    }

    @Override
    public int getItemViewType(int position) {
        return miId.equals(items.get(position).remitenteId) ? ENVIADO : RECIBIDO;
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        int layout = viewType == ENVIADO
                ? R.layout.item_mensaje_enviado
                : R.layout.item_mensaje_recibido;
        View v = LayoutInflater.from(parent.getContext()).inflate(layout, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Mensaje m = items.get(position);

        // Imagen o texto
        if (m.esImagen()) {
            h.ivImagen.setVisibility(View.VISIBLE);
            h.tvContenido.setVisibility(View.GONE);
            Glide.with(h.ivImagen).load(Imagenes.urlChat(m.contenido))
                    .placeholder(new ColorDrawable(0xFFDDDDDD))
                    .centerCrop()
                    .into(h.ivImagen);
            h.ivImagen.setOnClickListener(v -> acciones.onImagenClick(m));
        } else {
            Glide.with(h.ivImagen).clear(h.ivImagen);
            h.ivImagen.setVisibility(View.GONE);
            h.ivImagen.setOnClickListener(null);
            h.tvContenido.setVisibility(View.VISIBLE);
            if (m.eliminado) {
                h.tvContenido.setText("🚫 Mensaje eliminado");
                h.tvContenido.setTypeface(null, Typeface.ITALIC);
                h.tvContenido.setTextColor(GRIS);
            } else {
                h.tvContenido.setText(m.contenido);
                h.tvContenido.setTypeface(null, Typeface.NORMAL);
                h.tvContenido.setTextColor(NEGRO);
            }
        }

        h.tvHora.setText(Fechas.hora(m.creadoEn));

        // Nombre del remitente (solo en grupos y en mensajes recibidos)
        if (h.tvRemitente != null) {
            String nombre = nombres.get(m.remitenteId);
            if (esGrupo && nombre != null) {
                h.tvRemitente.setText(nombre);
                h.tvRemitente.setVisibility(View.VISIBLE);
            } else {
                h.tvRemitente.setVisibility(View.GONE);
            }
        }

        // Palomitas (solo en enviados)
        if (h.tvEstado != null) {
            if (m.eliminado) {
                h.tvEstado.setText("");
            } else if (m.leidoEn != null) {
                h.tvEstado.setText("✓✓");
                h.tvEstado.setTextColor(AZUL);
            } else if (m.entregadoEn != null) {
                h.tvEstado.setText("✓✓");
                h.tvEstado.setTextColor(GRIS);
            } else {
                h.tvEstado.setText("✓");
                h.tvEstado.setTextColor(GRIS);
            }
        }

        h.itemView.setOnLongClickListener(v -> {
            acciones.onLongClick(m);
            return true;
        });
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        TextView tvContenido, tvHora, tvEstado, tvRemitente;
        ImageView ivImagen;

        VH(View v) {
            super(v);
            tvContenido = v.findViewById(R.id.tvContenido);
            tvHora = v.findViewById(R.id.tvHora);
            tvEstado = v.findViewById(R.id.tvEstado);       // solo en enviados
            tvRemitente = v.findViewById(R.id.tvRemitente); // solo en recibidos
            ivImagen = v.findViewById(R.id.ivImagen);
        }
    }
}