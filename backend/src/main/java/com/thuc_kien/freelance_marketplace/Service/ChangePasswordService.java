package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.ChangePasswordRequestDTO;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChangePasswordService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    
}
