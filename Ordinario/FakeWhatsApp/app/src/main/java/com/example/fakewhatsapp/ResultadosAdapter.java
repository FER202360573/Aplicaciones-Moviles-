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

public class ResultadosAdapter extends RecyclerView.Adapter<ResultadosAdapter.VH> {

    public interface OnClick { void onClick(ResultadoBusqueda r); }

    private final List<ResultadoBusqueda> items = new ArrayList<>();
    private final String miId;
    private final OnClick listener;

    public ResultadosAdapter(String miId, OnClick listener) {
        this.miId = miId;
        this.listener = listener;
    }

    public void setItems(List<ResultadoBusqueda> nuevos) {
        items.clear();
        items.addAll(nuevos);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_resultado, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        ResultadoBusqueda r = items.get(position);
        h.tvTitulo.setText(r.titulo);
        h.tvFecha.setText(Fechas.corta(r.creadoEn));

        String quien = miId.equals(r.remitenteId) ? "Tú" : r.remitenteNombre;
        h.tvTexto.setText(quien + ": " + r.contenido);

        if ("grupo".equals(r.convTipo)) {
            Glide.with(h.ivAvatar).clear(h.ivAvatar);
            h.ivAvatar.setImageResource(R.drawable.ic_group);
        } else {
            Glide.with(h.ivAvatar).load(r.foto)
                    .placeholder(R.drawable.ic_person)
                    .fallback(R.drawable.ic_person)
                    .circleCrop().into(h.ivAvatar);
        }
        h.itemView.setOnClickListener(v -> listener.onClick(r));
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        ImageView ivAvatar;
        TextView tvTitulo, tvFecha, tvTexto;

        VH(View v) {
            super(v);
            ivAvatar = v.findViewById(R.id.ivAvatar);
            tvTitulo = v.findViewById(R.id.tvTitulo);
            tvFecha = v.findViewById(R.id.tvFecha);
            tvTexto = v.findViewById(R.id.tvTexto);
        }
    }
}