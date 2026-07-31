package com.lab.library.service;

import com.lab.library.dto.StoredImage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class ImageStorageService {

    private final String uploadDir;

    public ImageStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public StoredImage save(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "_" + originalName;
        byte[] data = file.getBytes();
        Files.write(uploadPath.resolve(fileName), data);
        return new StoredImage(data, resolveContentType(file.getContentType(), fileName), fileName);
    }

    public void delete(String fileName, String subDir) {
        if (!StringUtils.hasText(fileName)) {
            return;
        }
        try {
            Path filePath = Paths.get(uploadDir, subDir).resolve(fileName);
            Files.deleteIfExists(filePath);
            log.debug("Deleted image file: {}", fileName);
        } catch (IOException e) {
            log.warn("Failed to delete image file {}: {}", fileName, e.getMessage());
        }
    }

    public StoredImage readFromDisk(String legacyPath) {
        if (!StringUtils.hasText(legacyPath)) {
            return null;
        }
        try {
            Path filePath = Paths.get(uploadDir).resolve(legacyPath.startsWith("/") ? legacyPath.substring(1) : legacyPath);
            if (!Files.exists(filePath)) {
                log.warn("Legacy image file not found on disk: {}", filePath);
                return null;
            }
            String fileName = filePath.getFileName().toString();
            return new StoredImage(Files.readAllBytes(filePath), resolveContentType(Files.probeContentType(filePath), fileName), fileName);
        } catch (IOException e) {
            log.warn("Failed to read legacy image {}: {}", legacyPath, e.getMessage());
            return null;
        }
    }

    private String resolveContentType(String contentType, String fileName) {
        if (StringUtils.hasText(contentType) && !"application/octet-stream".equalsIgnoreCase(contentType)) {
            return contentType;
        }
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        return "image/jpeg";
    }
}
