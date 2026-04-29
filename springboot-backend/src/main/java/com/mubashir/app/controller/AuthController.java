package com.mubashir.app.controller;

import com.mubashir.app.dto.CreateUserRequest;
import com.mubashir.app.dto.CreateUserResponse;
import com.mubashir.app.dto.LogInRequest;
import com.mubashir.app.dto.LogInResponse;
import com.mubashir.app.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/app")
@RequiredArgsConstructor
public class AuthController{
    private final UserService userService;
    @PostMapping("/register")
    public CreateUserResponse register(@Valid @RequestBody CreateUserRequest request){
        return userService.createUser(request);
    }

    @PostMapping("/login")
    public LogInResponse login(@Valid @RequestBody LogInRequest request){
        return userService.verify(request);
    }
}
