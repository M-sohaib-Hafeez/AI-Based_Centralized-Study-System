package com.mubashir.app.config;

import com.mubashir.app.model.Country;
import com.mubashir.app.model.Course;
import com.mubashir.app.repository.CountryRepo;
import com.mubashir.app.repository.CourseRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.function.Consumer;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CountryRepo countryRepo;
    private final CourseRepo courseRepo;

    @Override
    @Transactional
    public void run(String... args) throws Exception{
        seedUnknownCountry();
        seedUnknownCourse();
        seedFromFile("/countries.txt", this::saveCountryIfMissing);
        seedFromFile("/courses.txt", this::saveCourseIfMissing);
    }

    private void seedFromFile(String path, Consumer<String> saver){
        try(InputStream is = getClass().getResourceAsStream(path);
            BufferedReader reader = new BufferedReader(new InputStreamReader(is))){
            reader.lines()
                    .map(String::trim)
                    .filter(line -> !line.isBlank())
                    .filter(line -> !line.startsWith("#"))
                    .distinct()
                    .forEach(saver);
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
            log.error(e.getMessage());
        }
    }

    private void seedUnknownCountry() {
        countryRepo.findByName("UNKNOWN")
                .orElseGet(() -> countryRepo.save(new Country("UNKNOWN")));
    }
    private void seedUnknownCourse(){
        courseRepo.findByName("UNKNOWN")
                .orElseGet(() -> courseRepo.save(new Course("UNKNOWN")));
    }

    private void saveCountryIfMissing(String name) {
        countryRepo.findByName(name)
                .orElseGet(() -> countryRepo.save(new Country(name)));
    }

    private void saveCourseIfMissing(String name) {
        courseRepo.findByName(name)
                .orElseGet(() -> courseRepo.save(new Course(name)));
    }
}