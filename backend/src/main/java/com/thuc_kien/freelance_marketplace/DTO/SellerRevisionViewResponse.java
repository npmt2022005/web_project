package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;

@Data
public class SellerRevisionViewResponse {
    private Long orderId;
    private String status;
    private String revisionNote;   
    private String revisionFileUrl;       

}
