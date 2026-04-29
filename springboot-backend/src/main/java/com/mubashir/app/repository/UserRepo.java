package com.mubashir.app.repository;

import com.mubashir.app.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<Users, UUID>{
    Optional<Users> findByUsername(String username);
    @Query("select u.id from Users u where u.username = :username")
    Optional<UUID> findIdByUsername(String username);

    boolean existsByUsername(String username);
}
