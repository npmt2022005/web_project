package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GigRequirementResponseDTO {
    private String question;
    private String answerType;  
    private Boolean isMandatory;
}