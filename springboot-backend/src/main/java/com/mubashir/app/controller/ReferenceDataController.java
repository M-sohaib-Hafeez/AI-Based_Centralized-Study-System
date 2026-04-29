package com.mubashir.app.controller;

import com.mubashir.app.model.Country;
import com.mubashir.app.model.Course;
import com.mubashir.app.service.ReferenceDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/app")
public class ReferenceDataController{
    private final ReferenceDataService referenceDataService;

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getCourses(){
        return ResponseEntity.ok().body(referenceDataService.getCourses());
    }

    @GetMapping("/countries")
    public ResponseEntity<List<Country>> getCountries(){
        return ResponseEntity.ok().body(referenceDataService.getCountries());
    }
}
