package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerService {
    private final SellerRepository sellerRepo;
    
    public List<String> getAllLanguage(){
        return sellerRepo.findAllLanguages();
    }
    
}
