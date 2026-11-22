package com.example.fakewhatsapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class SeleccionAdapter extends RecyclerView.Adapter<SeleccionAdapter.VH> {

    public interface OnCambio { void onCambio(int seleccionados); }

    private final List<Perfil> items = new ArrayList<>();
    private final Set<String> seleccionados = new LinkedHashSet<>();
    private final OnCambio listener;

    public SeleccionAdapter(OnCambio listener) { this.listener = listener; }

    public void setItems(List<Perfil> nuevos) {
        items.clear();
        items.addAll(nuevos);
        notifyDataSetChanged();
    }

    public Set<String> getSeleccionados() { return seleccionados; }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_contact_check, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Perfil p = items.get(position);
        h.tvNombre.setText(p.nombre);
        h.tvEstado.setText(p.estado != null ? p.estado : "");
        h.cbSeleccion.setChecked(seleccionados.contains(p.id));
        Glide.with(h.ivAvatar).load(p.avatarUrl)
                .placeholder(R.drawable.ic_person)
                .fallback(R.drawable.ic_person)
                .circleCrop().into(h.ivAvatar);

        h.itemView.setOnClickListener(v -> {
            if (!seleccionados.remove(p.id)) seleccionados.add(p.id);
            notifyItemChanged(h.getBindingAdapterPosition());
            listener.onCambio(seleccionados.size());
        });
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        CheckBox cbSeleccion;
        ImageView ivAvatar;
        TextView tvNombre, tvEstado;

        VH(View v) {
            super(v);
            cbSeleccion = v.findViewById(R.id.cbSeleccion);
            ivAvatar = v.findViewById(R.id.ivAvatar);
            tvNombre = v.findViewById(R.id.tvNombre);
            tvEstado = v.findViewById(R.id.tvEstado);
        }
    }
}