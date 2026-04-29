package com.mubashir.app.repository;

import com.mubashir.app.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepo extends JpaRepository<Course, UUID>{
    Optional<Course> findByName(String name);
}
