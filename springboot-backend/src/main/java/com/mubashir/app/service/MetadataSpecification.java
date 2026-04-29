package com.mubashir.app.service;

import com.mubashir.app.dto.SearchFilterRequest;
import com.mubashir.app.model.FileType;
import com.mubashir.app.model.Metadata;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class MetadataSpecification {

    public static Specification<Metadata> filter(SearchFilterRequest f) {
        return (root, query, cb) -> {

            query.distinct(true);
            Predicate p = cb.conjunction();

            if (f.getTitle() != null && !f.getTitle().isBlank()) {
                p = cb.and(p,
                        cb.like(
                                cb.lower(root.get("title")),
                                "%" + f.getTitle().toLowerCase() + "%"
                        ));
            }

            if (f.getFileType() != null && isValidType(f.getFileType())) {
                p = cb.and(p,
                        cb.equal(
                                root.get("fileType"),
                                FileType.valueOf(f.getFileType().toUpperCase())
                        ));
            }

            if (f.getUniversityName() != null && !f.getUniversityName().isBlank()) {
                p = cb.and(p,
                        cb.like(
                                cb.lower(root.get("university")),
                                "%" + f.getUniversityName().toLowerCase() + "%"
                        ));
            }

            if (f.getCountryId() != null) {
                Join<Object, Object> countryJoin = root.join("country", JoinType.LEFT);
                p = cb.and(p,
                        cb.equal(countryJoin.get("id"), f.getCountryId())
                );
            }

            if (f.getCourseId() != null) {
                Join<Object, Object> courseJoin = root.join("course", JoinType.LEFT);
                p = cb.and(p,
                        cb.equal(courseJoin.get("id"), f.getCourseId())
                );
            }

            return p;
        };
    }

    public static boolean isValidType(String fileType) {
        try {
            FileType.valueOf(fileType.toUpperCase());
            return true;
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }
}