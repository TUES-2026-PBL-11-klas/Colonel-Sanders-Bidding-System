package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.Product;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProductImageStorageService {

    private final MinioClient minioClient;
    private final String bucket;
    private final int urlExpirySeconds;

    public ProductImageStorageService(
            MinioClient minioClient,
            @Value("${minio.bucket.name}") String bucket,
            @Value("${minio.url-expiry-seconds}") int urlExpirySeconds
    ) {
        this.minioClient = minioClient;
        this.bucket = bucket;
        this.urlExpirySeconds = urlExpirySeconds;
    }

    public String uploadProductImage(Product product, MultipartFile file) {
        try {
            ensureBucketExists();
            String objectKey = buildObjectKey(product.getId(), file.getOriginalFilename());
            String contentType = file.getContentType() == null || file.getContentType().isBlank()
                    ? "application/octet-stream"
                    : file.getContentType();

            try (InputStream stream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(objectKey)
                                .stream(stream, file.getSize(), -1)
                                .contentType(contentType)
                                .build()
                );
            }

            return objectKey;
        } catch (Exception ex) {
            throw new RuntimeException("Failed to upload image to MinIO", ex);
        }
    }

    public String getPresignedUrl(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return null;
        }
        try {
            ensureBucketExists();
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(objectKey)
                            .expiry(urlExpirySeconds)
                            .build()
            );
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate image URL", ex);
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }

    private String buildObjectKey(Long productId, String originalFilename) {
        String extension = extractExtension(originalFilename);
        return "products/" + productId + "/" + UUID.randomUUID() + extension;
    }

    private String extractExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex).toLowerCase(Locale.ROOT);
    }
}
