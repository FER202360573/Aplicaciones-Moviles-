package com.example.fakewhatsapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;

public class ChatsAdapter extends RecyclerView.Adapter<ChatsAdapter.VH> {

    public interface OnChatClick { void onClick(Chat chat); }

    private final List<Chat> items = new ArrayList<>();
    private final String miId;
    private final OnChatClick listener;

    public ChatsAdapter(String miId, OnChatClick listener) {
        this.miId = miId;
        this.listener = listener;
    }

    public void setItems(List<Chat> nuevos) {
        items.clear();
        items.addAll(nuevos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_chat, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Chat c = items.get(position);
        h.tvNombre.setText(c.titulo);
        h.tvFecha.setText(Fechas.corta(c.ultimaFecha));
        h.tvUltimo.setText(textoUltimo(c));

        if (c.esGrupo()) {
            Glide.with(h.ivAvatar).clear(h.ivAvatar);
            h.ivAvatar.setImageResource(R.drawable.ic_group);
        } else {
            Glide.with(h.ivAvatar).load(c.foto)
                    .placeholder(R.drawable.ic_person)
                    .fallback(R.drawable.ic_person)
                    .circleCrop().into(h.ivAvatar);
        }
        h.itemView.setOnClickListener(v -> listener.onClick(c));
    }

    private String textoUltimo(Chat c) {
        if (c.ultimoMensaje == null) {
            return c.esGrupo() ? "Grupo creado" : "Sin mensajes todavía";
        }

        String texto;
        if (Boolean.TRUE.equals(c.ultimoEliminado)) texto = "🚫 Mensaje eliminado";
        else if ("imagen".equals(c.ultimoTipo)) texto = "📷 Foto";
        else texto = c.ultimoMensaje;

        if (miId.equals(c.ultimoRemitente)) return "Tú: " + texto;
        if (c.esGrupo() && c.ultimoRemitenteNombre != null) {
            return c.ultimoRemitenteNombre + ": " + texto;
        }
        return texto;
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        ImageView ivAvatar;
        TextView tvNombre, tvFecha, tvUltimo;

        VH(View v) {
            super(v);
            ivAvatar = v.findViewById(R.id.ivAvatar);
            tvNombre = v.findViewById(R.id.tvNombre);
            tvFecha = v.findViewById(R.id.tvFecha);
            tvUltimo = v.findViewById(R.id.tvUltimo);
        }
    }
}