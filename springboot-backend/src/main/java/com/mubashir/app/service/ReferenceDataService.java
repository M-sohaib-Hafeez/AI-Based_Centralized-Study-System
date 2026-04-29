package com.mubashir.app.service;

import com.mubashir.app.model.Country;
import com.mubashir.app.model.Course;
import com.mubashir.app.repository.CountryRepo;
import com.mubashir.app.repository.CourseRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReferenceDataService{
    private final CourseRepo courseRepo;
    private final CountryRepo countryRepo;

    public List<Country> getCountries(){
        return countryRepo.findAll();
    }

    public List<Course> getCourses(){
        return courseRepo.findAll();
    }
}
