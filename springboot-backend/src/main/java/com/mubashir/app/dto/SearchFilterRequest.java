package com.mubashir.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class SearchFilterRequest {
    private String title;
    private String fileType;
    private UUID countryId;
    private String universityName;
    private UUID courseId;
}