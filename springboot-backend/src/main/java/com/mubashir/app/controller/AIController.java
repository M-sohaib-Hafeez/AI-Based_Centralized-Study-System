package com.mubashir.app.controller;

import com.mubashir.app.dto.GenerateRequest;
import com.mubashir.app.dto.GenerateResponse;
import com.mubashir.app.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/app")
@RequiredArgsConstructor
public class AIController{
    private final AIService aIservice;
    @PostMapping("/files/{id}/generate")
    public ResponseEntity<GenerateResponse> generate(@PathVariable UUID id, @Valid @RequestBody GenerateRequest request){
        return aIservice.generateResponse(request,id);
    }
}
