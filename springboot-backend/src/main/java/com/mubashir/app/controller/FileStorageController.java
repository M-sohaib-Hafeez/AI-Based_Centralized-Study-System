package com.mubashir.app.controller;

import com.mubashir.app.model.Metadata;
import com.mubashir.app.service.FileStorageService;
import com.mubashir.app.service.MetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/app/files")
@RequiredArgsConstructor
public class FileStorageController {
    private final FileStorageService fileStorageService;
    private final MetadataService metadataService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("countryId") UUID countryId,
            @RequestParam("university") String university,
            @RequestParam("courseId") UUID courseId,
            Principal principal){
         UUID metadataId = fileStorageService.uploadFile(file, title ,
                countryId,university,courseId,principal.getName());
        return ResponseEntity
                .created(ServletUriComponentsBuilder
                        .fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(metadataId)
                        .toUri()).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID id, Principal principal) {
        Metadata metadata = fileStorageService.getMetadataById(id);
        if (!metadataService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (!metadata.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        fileStorageService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getFile(@PathVariable UUID id) {
        Resource resource = fileStorageService.getFile(id);
        Metadata metadata = fileStorageService.getMetadataById(id);

        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"" + metadata.getTitle() + "." + metadata.getFileType().toString().toLowerCase() + "\"")
                .body(resource);
    }
}