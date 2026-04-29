package com.mubashir.app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@NoArgsConstructor
@Getter
@Setter
@NamedEntityGraph(name = "Metadata.withAssociations",
        attributeNodes = {
                @NamedAttributeNode("country"),
                @NamedAttributeNode("course")
        }
)
public class Metadata {
    @Id
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileType fileType;

    @Column(length = 5,nullable = false)
    private String extension;

    private String fileStoredPath;

    private String university="UNKNOWN";

    @ManyToOne
    @JoinColumn(name="country_id")
    private Country country;

    @ManyToOne
    @JoinColumn(name="course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "uploaded_by",nullable = false)
    private Users user;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
