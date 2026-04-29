package com.mubashir.app.repository;

import com.mubashir.app.model.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CountryRepo extends JpaRepository<Country, UUID>{
    Optional<Country> findByName(String name);
}
