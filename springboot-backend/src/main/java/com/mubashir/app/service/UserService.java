package com.mubashir.app.service;

import com.mubashir.app.dto.CreateUserRequest;
import com.mubashir.app.dto.CreateUserResponse;
import com.mubashir.app.dto.LogInRequest;
import com.mubashir.app.dto.LogInResponse;
import com.mubashir.app.error.AppRuntimeException;
import com.mubashir.app.model.Users;
import com.mubashir.app.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService{
    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public CreateUserResponse createUser(CreateUserRequest request) {
        if(userRepo.existsByUsername(request.getUsername())) {
            throw new AppRuntimeException(
                    "Username '" + request.getUsername() + "' is already taken",
                    HttpStatus.CONFLICT
            );
        }
            Users user = new Users();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user = userRepo.save(user);

            return new CreateUserResponse(jwtService.generateToken(user.getUsername()),
                    user.getId(), user.getUsername(), user.getCreatedAt());
    }

    public LogInResponse verify(LogInRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        if (!authentication.isAuthenticated()) {
            throw new AppRuntimeException("User not found", HttpStatus.UNAUTHORIZED);
        }
        String jwtToken = jwtService.generateToken(request.getUsername());
        UUID userId = userRepo.findIdByUsername(request.getUsername())
                .orElseThrow(() -> new AppRuntimeException("User not found", HttpStatus.UNAUTHORIZED));
        return new LogInResponse(jwtToken, userId, request.getUsername());
    }

    public Users findByUsername(String username){
        return userRepo.findByUsername(username).orElseThrow(()->new AppRuntimeException("User not found", HttpStatus.UNAUTHORIZED));
    }
    public UUID findIdByUsername(String username){
        return userRepo.findIdByUsername(username).orElseThrow(()->new AppRuntimeException("User not found", HttpStatus.UNAUTHORIZED));
    }
}
