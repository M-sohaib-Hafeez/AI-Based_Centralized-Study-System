package com.mubashir.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@Getter
@Setter
public class CreateUserResponse
{private String jwtToken;
    private UUID id;
    private String username;
    private LocalDateTime createdAt;

}
