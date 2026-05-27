package com.thuc_kien.freelance_marketplace.Entity;

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

    private String categoryName;

    private Double price;

    @Field(type = FieldType.Keyword)
    private String level;

    private Integer deliveryTime;

    @Field(type = FieldType.Keyword)
    private String country;  

    @Field(type = FieldType.Keyword)
    private String language;
    

}
