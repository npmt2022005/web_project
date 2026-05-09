package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService{
    private final UserRepository userRepo;
    
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new CustomUserDetails(user); 
    }
}
