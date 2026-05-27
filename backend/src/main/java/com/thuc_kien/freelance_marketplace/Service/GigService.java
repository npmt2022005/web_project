package com.thuc_kien.freelance_marketplace.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.GigFeaturedResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchResponseDTO;
import com.thuc_kien.freelance_marketplace.Entity.*;
import com.thuc_kien.freelance_marketplace.Repository.*;

import jakarta.transaction.Transactional;

import org.springframework.data.elasticsearch.core.query.Query;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GigService {
    private final GigRepository gigRepo;
    private final GigElasticRepository gigElasticRepo;
    private final ElasticsearchOperations elasticsearchOperations;

    public Double getMaximumPrice() {
        Double maxPrice = gigRepo.findMaximumPrice();
        return (maxPrice != null) ? maxPrice : 20000000; 
    }
    public List<GigFeaturedResponseDTO> getFeaturedGigs(int limit) {
        Pageable pageable = PageRequest.of(0, limit); 

        List<Gig> gigs = gigRepo.findTopFeaturedGigs(pageable);

        return gigs.stream().map(gig -> GigFeaturedResponseDTO.builder()
                .title(gig.getTitle())      
                .price(gig.getPrice())   
                .thumbnailUrl(gig.getThumbnailUrl())
                .rating(gig.getRatingAvg())      
                .reviews(gig.getTotalReviews())  
                .seller(gig.getSeller().getUser().getFullname())
                .deliveryTime(gig.getDeliveryTime())
                .country(gig.getSeller().getUser().getCountry())
                .level(gig.getSeller().getLevel())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public void syncAllGigsFromMySQLToElastic() {
        gigElasticRepo.deleteAll();

        List<Gig> allGigsInMySQL = gigRepo.findAll();

        // 3. Chuyển đổi toàn bộ danh sách Entity sang dạng Document của Elasticsearch
        List<GigDoc> elasticDocs = allGigsInMySQL.stream().map(gig -> GigDoc.builder()
                .id(gig.getId().toString())
                .title(gig.getTitle())
                .categorySlug(gig.getCategory().getSlug())
                .price(gig.getPrice())
                .rating(gig.getRatingAvg())
                .reviews(gig.getTotalReviews())
                .seller(gig.getSeller().getUser().getFullname())
                .thumbnailUrl(gig.getThumbnailUrl())
                .deliveryTime(gig.getDeliveryTime())
                .country(gig.getSeller().getUser().getCountry())
                .level(gig.getSeller().getLevel())
                .build()
        ).collect(Collectors.toList());

        gigElasticRepo.saveAll(elasticDocs);
    }
    public List<GigSearchResponseDTO> searchGigs(GigSearchRequestDTO rq) {
        Pageable pageable = PageRequest.of(rq.getPage(), rq.getSize());

        String kw = (rq.getKeyword() != null) ? rq.getKeyword().trim() : "";
        Criteria criteria;
        if (kw != null && !kw.trim().isEmpty()) {
            criteria = new Criteria("title").fuzzy(kw); 
        } else {
            criteria = new Criteria(); 
        }

        String cat = rq.getCategory(); 
        if (cat != null && !cat.equals("All Categories") && !cat.trim().isEmpty()) {
            criteria = criteria.and("categorySlug").is(cat.trim());
        }
        if (rq.getLocation() != null && !rq.getLocation().trim().isEmpty()) {
            criteria = criteria.and("country").is(rq.getLocation().trim());
        }
        if (rq.getLevel() != null && !rq.getLevel().trim().isEmpty()) {
            criteria = criteria.and("level").is(rq.getLevel().trim()); 
        }
        if (rq.getDeliveryTime() != null && !rq.getDeliveryTime().trim().isEmpty()) {
            Integer days = null;
            switch (rq.getDeliveryTime().trim()) {
                    case "Express 24h":
                        days = 1;
                        break;
                    case "Up to 3 days":
                        days = 3;
                        break;
                    case "Up to 7 days":
                        days = 7;
                        break;
                    default:
                        break;
                }
            if (days != null) {
                criteria = criteria.and("deliveryTime").lessThanEqual(days);
            }
        }
        if (rq.getMinPrice() != null && rq.getMaxPrice() != null) {
            criteria = criteria.and("price").between(rq.getMinPrice(), rq.getMaxPrice());
        }
        Query query = new CriteriaQuery(criteria).setPageable(pageable);
        SearchHits<GigDoc> searchHits = elasticsearchOperations.search(query, GigDoc.class);

        return searchHits.stream()
                .map(SearchHit::getContent)
                .map(doc -> GigSearchResponseDTO.builder()
                        .id(Long.parseLong(doc.getId()))
                        .title(doc.getTitle())
                        .thumbnailUrl(doc.getThumbnailUrl())
                        .price(doc.getPrice())
                        .rating(doc.getRating())
                        .reviews(doc.getReviews())
                        .seller(doc.getSeller())
                        .deliveryTime(doc.getDeliveryTime())
                        .categoryName(doc.getCategorySlug())
                        .country(doc.getCountry())
                        .level(doc.getLevel())
                        .build()
                ).collect(Collectors.toList());
        }
    // @Transactional
    // public void createGig(GigRequestDTO dto, Long sellerId) {
    //     // 1. Lưu vào MySQL để giữ toàn vẹn dữ liệu hệ thống
    //     Gig gig = gigRepository.save(new Gig(...));

    //     // 2. Chuyển đổi dữ liệu sang dạng Document để nạp vào Elasticsearch
    //     GigDoc doc = GigDoc.builder()
    //             .id(gig.getId().toString())
    //             .title(gig.getTitle())
    //             .categorySlug(gig.getCategory().getSlug())
    //             .price(gig.getPrice())
    //             .rating(0.0)
    //             .reviews(0)
    //             .seller(gig.getSeller().getUser().getFullname())
    //             .thumbnailUrl(gig.getThumbnailUrl())
    //             .build();
                
    //     gigElasticRepository.save(doc); // Đẩy lên Cloud Search
    // }
}
