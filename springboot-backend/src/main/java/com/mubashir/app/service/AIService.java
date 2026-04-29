package com.mubashir.app.service;

import com.mubashir.app.dto.GenerateRequest;
import com.mubashir.app.dto.GenerateResponse;
import com.mubashir.app.error.AppRuntimeException;
import com.mubashir.app.model.Metadata;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * ✅ FIX: The original AIService had two problems:
 *
 *  1. It called fileStorageService.getFileForAI(id) which returns a Resource —
 *     but RestTemplate multipart needs a ByteArrayResource with a filename set,
 *     otherwise the "Content-Disposition: form-data; name=file" header is missing
 *     the filename and FastAPI rejects it.
 *
 *  2. It swallowed RestClientException — any connection error to FastAPI would
 *     surface as a 500 with no useful message.
 *
 * Solution: read the file bytes directly, wrap in ByteArrayResource with filename,
 * and add proper error handling.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final FileStorageService fileStorageService;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ResponseEntity<GenerateResponse> generateResponse(GenerateRequest request, UUID id) {

        // 1. Get metadata so we know the stored file path and name
        Metadata metadata = fileStorageService.getMetadataById(id);
        String storedRelativePath = metadata.getFileStoredPath(); // e.g. "2026-04-28/uuid.pdf"
        String fileName = metadata.getTitle() + "." + metadata.getExtension();

        // 2. Read the actual bytes from disk
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize()
                             .resolve(storedRelativePath);
        byte[] fileBytes;
        try {
            fileBytes = Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Could not read file for AI service: {}", filePath, e);
            throw new AppRuntimeException("Could not read file for AI processing.");
        }

        // 3. ✅ Wrap bytes in ByteArrayResource with a filename so multipart is correct
        ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return fileName; // required for multipart Content-Disposition header
            }
        };

        // 4. Build multipart body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("prompt", request.getPrompt());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // 5. Call FastAPI
        try {
            return restTemplate.postForEntity(
                    aiServiceUrl,
                    new HttpEntity<>(body, headers),
                    GenerateResponse.class
            );
        } catch (RestClientException e) {
            log.error("AI service call failed at {}: {}", aiServiceUrl, e.getMessage());
            throw new AppRuntimeException(
                "AI service is unavailable. Make sure FastAPI is running on port 8000."
            );
        }
    }
}
