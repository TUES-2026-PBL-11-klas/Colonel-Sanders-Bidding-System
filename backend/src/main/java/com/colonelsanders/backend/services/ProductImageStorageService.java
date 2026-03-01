package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.Product;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
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

    public ProductImageStorageService(
            MinioClient minioClient,
            @Value("${minio.bucket.name}") String bucket
    ) {
        this.minioClient = minioClient;
        this.bucket = bucket;
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

    public InputStream getImageStream(String objectKey) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .build()
            );
        } catch (Exception ex) {
            throw new RuntimeException("Failed to retrieve image from MinIO", ex);
        }
    }

    public String getImageContentType(String objectKey) {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectKey)
                            .build()
            );
            return stat.contentType();
        } catch (Exception ex) {
            return "application/octet-stream";
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
