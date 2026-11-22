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

public class ContactsAdapter extends RecyclerView.Adapter<ContactsAdapter.VH> {

    public interface OnContactClick { void onClick(Perfil perfil); }

    private final List<Perfil> items = new ArrayList<>();
    private final OnContactClick listener;

    public ContactsAdapter(OnContactClick listener) { this.listener = listener; }

    public void setItems(List<Perfil> nuevos) {
        items.clear();
        items.addAll(nuevos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_contact, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Perfil p = items.get(position);
        h.tvNombre.setText(p.nombre);
        h.tvEstado.setText(p.estado != null ? p.estado : "");
        Glide.with(h.ivAvatar).load(p.avatarUrl)
                .placeholder(R.drawable.ic_person)
                .fallback(R.drawable.ic_person)
                .circleCrop().into(h.ivAvatar);
        h.itemView.setOnClickListener(v -> listener.onClick(p));
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        ImageView ivAvatar;
        TextView tvNombre, tvEstado;

        VH(View v) {
            super(v);
            ivAvatar = v.findViewById(R.id.ivAvatar);
            tvNombre = v.findViewById(R.id.tvNombre);
            tvEstado = v.findViewById(R.id.tvEstado);
        }
    }
}