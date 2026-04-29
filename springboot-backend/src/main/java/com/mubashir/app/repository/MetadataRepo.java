package com.mubashir.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.mubashir.app.model.Metadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MetadataRepo extends JpaRepository<Metadata, UUID>, JpaSpecificationExecutor<Metadata>{
    @EntityGraph(attributePaths = {"country", "course"})
    List<Metadata> findAllByUserId(UUID userId);

    @EntityGraph(attributePaths = {"country", "course"})
    Page<Metadata> findAll(Specification<Metadata> spec, Pageable pageable);

    @EntityGraph("Metadata.withAssociations")
    Optional<Metadata> findById(UUID id);
}