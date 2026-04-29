package com.mubashir.app.model;

import com.mubashir.app.error.AppRuntimeException;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.List;

public enum FileType {
    WORD(List.of("doc", "docx", "rtf", "odt")),

    PRESENTATION(List.of("ppt", "pptx", "odp")),

    PDF(List.of("pdf")),

    IMAGE(List.of("jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"));

    private final List<String> extensions;

    FileType(List<String> extensions) {
        this.extensions = extensions;
    }

    public static FileType fromExtension(String ext) {
        return Arrays.stream(values())
                .filter(t -> t.extensions.contains(ext.toLowerCase()))
                .findFirst()
                .orElseThrow(() ->
                        new AppRuntimeException("extension \""+ext+"\"not allowed", HttpStatus.NOT_ACCEPTABLE));
    }
}