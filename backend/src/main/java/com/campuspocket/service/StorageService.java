package com.campuspocket.service;

public interface StorageService {
    String uploadProfileImage(String rollNo, byte[] fileBytes, String contentType);
    void deleteProfileImage(String rollNo);
    String getImageUrl(String rollNo);
}
