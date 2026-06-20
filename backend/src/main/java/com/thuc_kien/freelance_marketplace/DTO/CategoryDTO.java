package com.thuc_kien.freelance_marketplace.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private String slug;
    private String imgUrl;
    private Long parentId; 
}