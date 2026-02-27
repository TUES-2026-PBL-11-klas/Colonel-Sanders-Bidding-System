package com.colonelsanders.backend.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Value("${minio.url}")
    private String url;

    @Value("${minio.public-url}")
    private String publicUrl;

    @Value("${minio.access.name}")
    private String accessKey;

    @Value("${minio.access.secret}")
    private String accessSecret;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, accessSecret)
                .build();
    }

    @Bean
    public MinioClient publicMinioClient() {
        return MinioClient.builder()
                .endpoint(publicUrl)
                .credentials(accessKey, accessSecret)
                .region("us-east-1")
                .build();
    }
}