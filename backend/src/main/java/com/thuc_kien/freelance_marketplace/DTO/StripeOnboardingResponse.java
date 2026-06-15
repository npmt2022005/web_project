package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StripeOnboardingResponse {
    private String onboardingUrl;
}
