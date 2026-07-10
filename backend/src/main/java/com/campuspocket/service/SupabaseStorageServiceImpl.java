package com.campuspocket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SupabaseStorageServiceImpl implements StorageService {

    private final String supabaseUrl;
    private final String serviceKey;
    private final String bucket;
    private final HttpClient httpClient;

    public SupabaseStorageServiceImpl(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.service.key:}") String serviceKey,
            @Value("${supabase.bucket:avatars}") String bucket) {
        this.supabaseUrl = supabaseUrl != null ? supabaseUrl.trim() : "";
        this.serviceKey = serviceKey != null ? serviceKey.trim() : "";
        this.bucket = bucket != null ? bucket.trim() : "avatars";
        this.httpClient = HttpClient.newHttpClient();
    }

    private boolean isConfigured() {
        return !supabaseUrl.isEmpty() && !serviceKey.isEmpty();
    }

    @Override
    public String uploadProfileImage(String rollNo, byte[] fileBytes, String contentType) {
        String filePath = "students/" + rollNo + ".webp";
        
        if (isConfigured()) {
            try {
                String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filePath;
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(uploadUrl))
                        .header("Authorization", "Bearer " + serviceKey)
                        .header("apikey", serviceKey)
                        .header("x-upsert", "true")
                        .header("Content-Type", contentType != null ? contentType : "image/webp")
                        .POST(HttpRequest.BodyPublishers.ofByteArray(fileBytes))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() == 200 || response.statusCode() == 201) {
                    return getImageUrl(rollNo);
                } else {
                    throw new RuntimeException("Failed to upload avatar to Supabase: " + response.statusCode() + " - " + response.body());
                }
            } catch (Exception e) {
                throw new RuntimeException("Supabase upload exception: " + e.getMessage(), e);
            }
        } else {
            // Local Fallback Storage
            try {
                Path dirPath = Paths.get("uploads", "students");
                if (!Files.exists(dirPath)) {
                    Files.createDirectories(dirPath);
                }
                
                Path targetPath = dirPath.resolve(rollNo + ".webp");
                Files.write(targetPath, fileBytes);
                
                return "/uploads/students/" + rollNo + ".webp";
            } catch (IOException e) {
                throw new RuntimeException("Failed to save avatar locally: " + e.getMessage(), e);
            }
        }
    }

    @Override
    public void deleteProfileImage(String rollNo) {
        String filePath = "students/" + rollNo + ".webp";
        
        if (isConfigured()) {
            try {
                String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + filePath;
                
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(deleteUrl))
                        .header("Authorization", "Bearer " + serviceKey)
                        .header("apikey", serviceKey)
                        .DELETE()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() != 200 && response.statusCode() != 204 && response.statusCode() != 404) {
                    System.err.println("Supabase delete avatar failed: " + response.statusCode() + " - " + response.body());
                }
            } catch (Exception e) {
                System.err.println("Supabase delete avatar exception: " + e.getMessage());
            }
        } else {
            // Local Fallback Delete
            try {
                Path targetPath = Paths.get("uploads", "students", rollNo + ".webp");
                Files.deleteIfExists(targetPath);
            } catch (IOException e) {
                System.err.println("Failed to delete avatar locally: " + e.getMessage());
            }
        }
    }

    @Override
    public String getImageUrl(String rollNo) {
        if (isConfigured()) {
            return supabaseUrl + "/storage/v1/object/public/" + bucket + "/students/" + rollNo + ".webp";
        } else {
            // Check if local file exists
            Path targetPath = Paths.get("uploads", "students", rollNo + ".webp");
            if (Files.exists(targetPath)) {
                return "/uploads/students/" + rollNo + ".webp";
            }
            return null;
        }
    }
}
