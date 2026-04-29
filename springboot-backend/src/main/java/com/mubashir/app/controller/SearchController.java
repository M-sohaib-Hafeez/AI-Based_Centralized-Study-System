package com.mubashir.app.controller;

import com.mubashir.app.dto.SearchFilterRequest;
import com.mubashir.app.dto.SearchFilterResponse;
import com.mubashir.app.service.MetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/app")
@RequiredArgsConstructor
public class SearchController {
    private final MetadataService metadataService;

    @PostMapping("/search")
    public ResponseEntity<Page<SearchFilterResponse>> search(
            @RequestBody SearchFilterRequest filter,
            @RequestParam(defaultValue = "0") int page){

        return ResponseEntity.ok(metadataService.search(filter, page));
    }

    @GetMapping("/my-files")
    public ResponseEntity<List<SearchFilterResponse>> getMyFiles(Principal principal){
        return ResponseEntity.ok().body(metadataService.getMyFiles(principal.getName()));
    }
}