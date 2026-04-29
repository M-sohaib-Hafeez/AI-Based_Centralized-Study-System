package com.mubashir.app.service;

import com.mubashir.app.model.UserPrinciple;
import com.mubashir.app.model.Users;
import com.mubashir.app.repository.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class MyUserDetailsService implements UserDetailsService{
    private final UserRepo userRepo;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        Users users = userRepo.findByUsername(username).orElseThrow(()->new UsernameNotFoundException("user not found"));
        return new UserPrinciple(users);
    }
}
