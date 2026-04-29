package com.mubashir.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class SearchFilterResponse{
    private UUID id;
    private String title;
    private String extension;
    private String fileType;
    private String countryName;
    private String courseName;
}
