package com.mubashir.app.service;

import com.mubashir.app.error.AppRuntimeException;
import com.mubashir.app.model.FileType;
import com.mubashir.app.model.Metadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Transactional
public class FileStorageService {
    private final Path fileStorageLocation;
    private final long maxFileSize;

    private final MetadataService metadataService;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir,
                              @Value("${file.max-size:10485760}") long maxFileSize,
                              MetadataService metadataService) {
        this.metadataService = metadataService;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize;
        try {
            Files.createDirectories(fileStorageLocation);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public UUID uploadFile(
            MultipartFile file,
            String title,
            UUID countryId,
            String university,
            UUID courseId,
            String username
    ){
        if(file.getSize() > maxFileSize) {
            throw new AppRuntimeException(
                    "File size exceeds maximum allowed: " + maxFileSize + " bytes", HttpStatus.NOT_ACCEPTABLE
            );
        }

        String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();
        FileType fileType = FileType.fromExtension(extension);

        long usableSpace = fileStorageLocation.toFile().getUsableSpace();
        if (usableSpace < file.getSize()) {
            throw new AppRuntimeException("Server storage is running low.");
        }
        Path dateDir = fileStorageLocation.resolve(LocalDate.now().toString());
        try {
            Files.createDirectories(dateDir);
        } catch (IOException e) {
            throw new AppRuntimeException("Could not create directory");
        }
        Metadata metadata = metadataService.createUnsavedMetadata(
                title,
                fileType,
                extension,
                countryId,
                university,
                courseId,
                username
        );
        metadata.setId(UUID.randomUUID());
        UUID fileId = metadata.getId();
        String fileName = fileId + "." + extension;
        Path filePath = dateDir.resolve(fileName);

        String relativePath = LocalDate.now() + "/" + fileName;
        metadata.setFileStoredPath(relativePath);
        metadataService.save(metadata);
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);;
            return fileId;
        } catch (IOException ex) {
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
            throw new AppRuntimeException("Could not upload file");
        }
    }

    public Resource getFile(UUID id) {
        Metadata metadata = metadataService.findById(id);
        Path filePath = resolveFilePath(metadata);

        if (!Files.exists(filePath)) {
            Path foundPath = searchFileInDateDirectories(metadata);
            if (foundPath == null){
                metadataService.deleteMetadata(metadata);
                throw new AppRuntimeException("File not found");
            }
            filePath = foundPath;

            String relativePath = getRelativePath(filePath);
            metadata.setFileStoredPath(relativePath);
            metadataService.updateMetadata(metadata);
        }
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new AppRuntimeException("File is not readable",HttpStatus.UNPROCESSABLE_ENTITY);
            }
        } catch (MalformedURLException e) {
            throw new AppRuntimeException("Error accessing file",HttpStatus.BAD_REQUEST);
        }
    }

    public Resource getFileForAI(UUID id) {
        Metadata metadata = metadataService.findById(id);
        Path filePath = resolveFilePath(metadata);

        if (!Files.exists(filePath)) {
            Path foundPath = searchFileInDateDirectories(metadata);
            if (foundPath == null) {
                throw new AppRuntimeException("File not found for AI",HttpStatus.NOT_FOUND);
            }
            filePath = foundPath;
        }

        return new FileSystemResource(filePath);
    }

    public void deleteFile(UUID id){
        Metadata metadata=metadataService.findById(id);
        Path filePath=resolveFilePath(metadata);
        boolean deleted = false;
        if (Files.exists(filePath)) {
            try {
                Files.delete(filePath);
                deleted = true;
            } catch (IOException e) {
                throw new AppRuntimeException("Could not delete file",HttpStatus.NOT_FOUND);
            }
        }
        else{
            Path foundPath = searchFileInDateDirectories(metadata);
            if (foundPath != null) {
                try {
                    Files.delete(foundPath);
                    deleted = true;
                } catch (IOException e) {
                    throw new AppRuntimeException("Could not delete file",HttpStatus.NOT_FOUND);
                }
            }
        }
        if(deleted){
            cleanUpEmptyDateDirectories();
            metadataService.deleteMetadata(metadata);
        }


    }

    public Metadata getMetadataById(UUID id) {
        return metadataService.findById(id);
    }

    private Path resolveFilePath(Metadata metadata) {
        if (metadata.getFileStoredPath() != null) {
            return fileStorageLocation.resolve(metadata.getFileStoredPath());
        }

        if (metadata.getUploadedAt() != null) {
            String extension = metadata.getExtension().toLowerCase();
            Path fallbackPath = fileStorageLocation
                    .resolve(metadata.getUploadedAt().toLocalDate().toString())
                    .resolve(metadata.getId().toString() + "." + extension);
            return fallbackPath;
        }
        return null;
    }

    private Path searchFileInDateDirectories(Metadata metadata) {
        String fileName = metadata.getId().toString();
        try {
            try (Stream<Path> paths = Files.walk(fileStorageLocation, 2)) {
                return paths
                        .filter(Files::isRegularFile)
                        .filter(path -> {
                            String name = path.getFileName().toString();
                            return name.startsWith(fileName + ".");
                        })
                        .findFirst()
                        .orElse(null);
            }
        } catch (IOException e) {
            return null;
        }
    }

    private String getRelativePath(Path absolutePath) {
        return fileStorageLocation.relativize(absolutePath).toString();
    }

    private void cleanUpEmptyDateDirectories() {
        try {
            try (Stream<Path> directories = Files.list(fileStorageLocation)) {
                directories
                        .filter(Files::isDirectory)
                        .forEach(dir -> {
                            try {
                                if (isDirectoryEmpty(dir)) {
                                    Files.delete(dir);
                                }
                            } catch (IOException e){
                                e.printStackTrace();
                            }
                        });
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean isDirectoryEmpty(Path dir) throws IOException {
        try (Stream<Path> entries = Files.list(dir)) {
            return entries.findFirst().isEmpty();
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}