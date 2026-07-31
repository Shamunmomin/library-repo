package com.lab.library.dto;

public record StoredImage(byte[] data, String contentType, String fileName) {
}
