package com.thuc_kien.freelance_marketplace.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.Repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepo;

    public List<String> getDistinctActiveCountries() {
        return userRepo.findDistinctActiveCountries();
    }

}
