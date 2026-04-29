package com.mubashir.app.service;

import com.mubashir.app.dto.SearchFilterRequest;
import com.mubashir.app.dto.SearchFilterResponse;
import com.mubashir.app.error.AppRuntimeException;
import com.mubashir.app.model.Country;
import com.mubashir.app.model.Course;
import com.mubashir.app.model.FileType;
import com.mubashir.app.model.Metadata;
import com.mubashir.app.repository.CountryRepo;
import com.mubashir.app.repository.CourseRepo;
import com.mubashir.app.repository.MetadataRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MetadataService{
    private final MetadataRepo metadataRepo;
    private final UserService userService;
    private final CourseRepo courseRepo;
    private final CountryRepo countryRepo;

    @Transactional(propagation = Propagation.REQUIRED)
    public Metadata createUnsavedMetadata(String title,FileType fileType, String extension, UUID countryId, String university, UUID courseId , String  username){
        Metadata metadata = new Metadata();
        metadata.setTitle(title);
        metadata.setFileType(fileType);
        metadata.setExtension(extension);
        metadata.setUser(userService.findByUsername(username));
        metadata.setCountry(getCountry(countryId));
        metadata.setUniversity((university!=null)?university:"UNKNOWN");
        metadata.setCourse(getCourse(courseId));
        return metadata;
    }

    public void updateMetadata(Metadata metadata) {
        metadataRepo.save(metadata);
    }

    private Country getCountry(UUID countryId){
            return (countryId  != null) ? countryRepo.findById(countryId)
                    .orElseGet(() ->
                            countryRepo.findByName("UNKNOWN").orElseThrow(()->new AppRuntimeException("try again", HttpStatus.NOT_FOUND)))
                    : countryRepo.findByName("UNKNOWN").orElseThrow(()->new AppRuntimeException("try again", HttpStatus.NOT_FOUND));

    }

    private Course getCourse(UUID courseId) {
       return (courseId !=null)?courseRepo.findById(courseId)
                .orElseGet(() ->
                        courseRepo.findByName("UNKNOWN").orElseThrow(()->new AppRuntimeException("try again", HttpStatus.NOT_FOUND)))
               :courseRepo.findByName("UNKNOWN").orElseThrow(()->new AppRuntimeException("try again", HttpStatus.NOT_FOUND));
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteMetadata(Metadata metadata) {
        metadataRepo.delete(metadata);
    }

    public Metadata findById(UUID id){
        return metadataRepo.findById(id).orElseThrow(()->new AppRuntimeException("no record found for file", HttpStatus.NOT_FOUND));
    }

    public Page<SearchFilterResponse> search(SearchFilterRequest filter, int page) {
        Pageable pageable = PageRequest.of(page, 12, Sort.by("uploadedAt").descending());

        Page<Metadata> metadataPage = metadataRepo.findAll(
                MetadataSpecification.filter(filter),
                pageable
        );

        return metadataPage.map(this::convertToResponse);
    }

    private SearchFilterResponse convertToResponse(Metadata metadata) {
        return new SearchFilterResponse(
                metadata.getId(),
                metadata.getTitle(),
                metadata.getExtension(),
                metadata.getFileType().toString(),
                metadata.getCountry().getName(),
                metadata.getCourse() != null ? metadata.getCourse().getName() : null

        );
    }

    public List<SearchFilterResponse> getMyFiles(String username){
        return metadataRepo.findAllByUserId(userService.findIdByUsername(username))
                .stream().map(metadata-> new SearchFilterResponse(
                metadata.getId(),
                metadata.getTitle(),
                metadata.getExtension(),
                metadata.getFileType().toString(),
                metadata.getCountry().getName(),
                metadata.getCourse() != null ? metadata.getCourse().getName() : null
        )).toList();
    }

    public void save(Metadata metadata){
        metadataRepo.save(metadata);
    }

    public boolean existsById(UUID id){
        return metadataRepo.existsById(id);
    }
}
