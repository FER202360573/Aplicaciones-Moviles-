package com.example.fakewhatsapp;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;

public interface TestApi {
    @GET("auth/v1/health")
    Call<ResponseBody> health();
}