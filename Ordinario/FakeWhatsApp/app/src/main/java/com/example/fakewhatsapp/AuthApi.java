package com.example.fakewhatsapp;

import retrofit2.Call;
import retrofit2.http.*;

public interface AuthApi {

    @POST("auth/v1/signup")
    Call<AuthModels.AuthResponse> signUp(@Body AuthModels.SignUpRequest body);

    @POST("auth/v1/token?grant_type=password")
    Call<AuthModels.AuthResponse> login(@Body AuthModels.LoginRequest body);

    @POST("auth/v1/token?grant_type=refresh_token")
    Call<AuthModels.AuthResponse> refresh(@Body AuthModels.RefreshRequest body);

    @POST("auth/v1/logout")
    Call<Void> logout();

    @POST("auth/v1/recover")
    Call<Void> recover(@Body AuthModels.RecoverRequest body,
                       @Query("redirect_to") String redirectTo);

    @PUT("auth/v1/user")
    Call<Void> updatePassword(@Header("Authorization") String bearer,
                              @Body AuthModels.UpdatePasswordRequest body);
}