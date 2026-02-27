package com.colonelsanders.backend.services;

import com.colonelsanders.backend.database.models.Product;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductImageStorageServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private ProductImageStorageService service;

    @BeforeEach
    void setup() {
        // set bucket name and expiry via constructor injection, reflection not needed because fields are final
        service = new ProductImageStorageService(minioClient, "test-bucket", 60);
    }

    @Test
    void uploadProductImage_existingBucket_putsObjectAndReturnsKey() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);
        when(minioClient.putObject(any(PutObjectArgs.class))).thenReturn(null);

        Product product = new Product();
        product.setId(42L);
        MockMultipartFile file = new MockMultipartFile("file", "photo.JPG", "image/jpeg", "data".getBytes());

        String returned = service.uploadProductImage(product, file);
        assertNotNull(returned);
        assertTrue(returned.startsWith("products/42/"));
        assertTrue(returned.toLowerCase().endsWith(".jpg"));

        ArgumentCaptor<PutObjectArgs> captor = ArgumentCaptor.forClass(PutObjectArgs.class);
        verify(minioClient).putObject(captor.capture());
        PutObjectArgs args = captor.getValue();
        assertEquals("test-bucket", args.bucket());
        assertEquals(returned, args.object());
        assertEquals("image/jpeg", args.contentType());
    }

    @Test
    void uploadProductImage_bucketDoesNotExist_createsBucket() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);
        when(minioClient.putObject(any(PutObjectArgs.class))).thenReturn(null);
        doNothing().when(minioClient).makeBucket(any(MakeBucketArgs.class));

        Product product = new Product();
        product.setId(5L);
        MockMultipartFile file = new MockMultipartFile("file", "img.png", "image/png", "123".getBytes());

        service.uploadProductImage(product, file);
        verify(minioClient).makeBucket(any(MakeBucketArgs.class));
    }

    @Test
    void getPresignedUrl_nullOrBlank_returnsNull() {
        assertNull(service.getPresignedUrl(null));
        assertNull(service.getPresignedUrl(""));
        assertNull(service.getPresignedUrl("   "));
    }

    @Test
    void getPresignedUrl_validKey_invokesMinio() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class))).thenReturn("http://url");

        String result = service.getPresignedUrl("somekey");
        assertEquals("http://url", result);

        ArgumentCaptor<GetPresignedObjectUrlArgs> captor = ArgumentCaptor.forClass(GetPresignedObjectUrlArgs.class);
        verify(minioClient).getPresignedObjectUrl(captor.capture());
        assertEquals("test-bucket", captor.getValue().bucket());
    }
}
