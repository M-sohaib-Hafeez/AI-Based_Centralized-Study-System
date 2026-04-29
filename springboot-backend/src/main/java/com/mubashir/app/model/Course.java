package com.mubashir.app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Course extends BaseUuidEntity{
    @Column(nullable = false, unique = true)
    private String name;
}
