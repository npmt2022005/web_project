package com.thuc_kien.freelance_marketplace.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.thuc_kien.freelance_marketplace.Entity.User;

public class CustomUserDetails implements UserDetails{
    private final User user;
    
    public CustomUserDetails(User user){
        this.user = user;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

    return List.of(new SimpleGrantedAuthority(user.getCurrentRole().name()));
}
    @Override
    public String getPassword() { return user.getPasswordHash(); }

    @Override
    public String getUsername() { return user.getEmail(); }
    
    // Các thông số mặc định để tài khoản hoạt động
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }


    public User getUser(){ return user;}







}
