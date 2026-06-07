package com.thuc_kien.freelance_marketplace.Entity;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor 
@Document(indexName = "gigs") 
public class GigDoc {

    @Id
    private String id; 

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;    

    @Field(type = FieldType.Keyword)
    private String categorySlug; 

    private String thumbnailUrl; 
    private String seller;
    private Double rating;       
    private Integer reviews;

    @Field(type = FieldType.Text)
    private String categoryName;

    private BigDecimal price;

    @Field(type = FieldType.Keyword)
    private String level;

    private Integer deliveryTime;

    @Field(type = FieldType.Keyword)
    private String country;  

    @Field(type = FieldType.Keyword)
    private List<String> languages;

    

}
