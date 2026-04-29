package com.mubashir.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GenerateRequest{
    @NotBlank
    private String prompt;
}
