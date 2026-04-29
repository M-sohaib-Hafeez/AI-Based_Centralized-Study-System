package com.mubashir.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest{
    @Size(min = 5, message = "Username must be at least 5 characters long")
    @Pattern(
            regexp = "^[A-Za-z0-9_]+$",
            message = "Username can contain only letters, numbers, and underscores"
    )
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8,message ="must contain at least 8 character long")
    private String password;
}
