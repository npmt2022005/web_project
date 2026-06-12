package com.thuc_kien.freelance_marketplace.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;

import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.GigCardDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigCreateRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigDetailResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigFeaturedResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchResponseDTO;
import com.thuc_kien.freelance_marketplace.Entity.*;
import com.thuc_kien.freelance_marketplace.Repository.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GigService {
    private final GigRepository gigRepo;
    private final GigElasticRepository gigElasticRepo;
    private final ElasticsearchOperations elasticsearchOperations;
    private final CategoryService categoryService;
    private final SellerRepository sellerRepo;
    private final CategoryRepository cateRepo;
    public Double getMaximumPrice() {
        Double maxPrice = gigRepo.findMaximumPrice();
        return (maxPrice != null) ? maxPrice : 20000000;
    }
    public List<GigFeaturedResponseDTO> getFeaturedGigs(int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        List<Gig> gigs = gigRepo.findTopFeaturedGigs(pageable);

        return gigs.stream().map(gig -> GigFeaturedResponseDTO.builder()
                .id(gig.getId())
                .title(gig.getTitle())
                .price(gig.getPrice())
                .thumbnailUrl(gig.getThumbnailUrl())
                .rating(gig.getRatingAvg())
                .reviews(gig.getTotalReviews())
                .seller(gig.getSeller().getUser().getFullname())
                .deliveryTime(gig.getDeliveryTime())
                .country(gig.getSeller().getUser().getCountry())
                .level(gig.getSeller().getLevel())
                .build()).collect(Collectors.toList());
    }
    private GigDoc convertToGigDoc(Gig gig) {
        return GigDoc.builder()
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
                .languages(gig.getSeller().getLanguages())
                .categoryName(gig.getCategory().getName())
                .build();
    }
    public void syncGigToElasTic(Gig gig){
        GigDoc elasticDoc = convertToGigDoc(gig);
        gigElasticRepo.save(elasticDoc);
    }
    public void removeGigFromElastic(Long gigId) {
        gigElasticRepo.deleteById(gigId.toString());
    }
    @Transactional
    public void syncAllGigsFromMySQLToElastic() {
        gigElasticRepo.deleteAll();
        
        List<Gig> allGigsInMySQL = gigRepo.findAll();
        
        List<GigDoc> elasticDocs = allGigsInMySQL.stream()
                .map(this::convertToGigDoc) 
                .collect(Collectors.toList());

        gigElasticRepo.saveAll(elasticDocs);
    }
    public List<GigSearchResponseDTO> searchGigs(GigSearchRequestDTO rq) {
        String kw = (rq.getKeyword() != null) ? rq.getKeyword().trim() : "";

        Sort sort = Sort.by(Sort.Direction.DESC, "_score");
        if (rq.getSortBy() != null && !rq.getSortBy().trim().isEmpty()) {
            switch (rq.getSortBy().trim()) {
                case "BestSeller":
                    sort = Sort.by(Sort.Direction.DESC, "reviews");
                    break;
                case "NewArrivals":
                    sort = Sort.by(Sort.Direction.DESC, "id");
                    break;
                case "Recommended":
                default:
                    sort = Sort.by(Sort.Direction.DESC, "_score");
                    break;
            }
        }

        Pageable pageable = PageRequest.of(rq.getPage(), rq.getSize(), sort);

        final String cleanKw = kw;

        // Tính trước deliveryTime để dùng trong lambda
        Integer deliveryDays;
        if (rq.getDeliveryTime() != null && !rq.getDeliveryTime().trim().isEmpty()) {
            switch (rq.getDeliveryTime().trim()) {
                case "Express 24h":  deliveryDays = 1; break;
                case "Up to 3 days": deliveryDays = 3; break;
                case "Up to 7 days": deliveryDays = 7; break;
                default:             deliveryDays = null; break;
            }
        } else {
            deliveryDays = null;
        }

        final List<String> targetSlugs;
        String cat = rq.getCategory();
        if (cat != null && !cat.equals("All Categories") && !cat.trim().isEmpty()) {
            targetSlugs = categoryService.getAllChildSlugByParentSlug(cat.trim());
            targetSlugs.add(cat.trim());
        } else {
            targetSlugs = null;
        }

        final Integer finalDeliveryDays = deliveryDays;

        NativeQuery nativeQuery = NativeQuery.builder()
            .withQuery(q -> q
                .bool(b -> {
                    // --- MUST: fuzzy keyword search trên title và categoryName ---
                    if (!cleanKw.isEmpty()) {
                        b.must(m -> m
                            .multiMatch(mm -> mm
                                .query(cleanKw)
                                .fields("title^3", "categoryName^1") 
                                .fuzziness("AUTO")                
                            )
                        );
                    }


                    // Lọc theo category slug
                    if (targetSlugs != null) {
                        System.out.println(">>> Dữ liệu trong Elasticsearch: marketing-nguoi-anh-huong");
                        System.out.println(">>> Danh sách slugs truyền vào hàm: " + targetSlugs);
                        b.filter(f -> f
                            .terms(t -> t
                                .field("categorySlug")
                                .terms(tv -> tv.value(
                                    targetSlugs.stream()
                                        .map(co.elastic.clients.elasticsearch._types.FieldValue::of)
                                        .collect(Collectors.toList())
                                ))
                            )
                        );
                    }

                    // Lọc theo country
                    if (rq.getLocation() != null && !rq.getLocation().trim().isEmpty()) {
                        b.filter(f -> f.term(t -> t.field("country").value(rq.getLocation().trim())));
                    }

                    // Lọc theo level
                    if (rq.getLevel() != null && !rq.getLevel().trim().isEmpty()) {
                        b.filter(f -> f.term(t -> t.field("level").value(rq.getLevel().trim())));
                    }

                    // Lọc theo languages
                    if (rq.getLanguages() != null && !rq.getLanguages().isEmpty()) {
                        log.debug(">>> [DEBUG] Dữ liệu mảng gửi lên: {}", rq.getLanguages());
                        b.filter(f -> f
                            .terms(t -> t
                                .field("languages")
                                .terms(tv -> tv.value(
                                    rq.getLanguages().stream()
                                        .map(co.elastic.clients.elasticsearch._types.FieldValue::of)
                                        .collect(Collectors.toList())
                                ))
                            )
                        );
                    }

                    // Lọc theo deliveryTime
                    if (finalDeliveryDays != null) {
                        b.filter(f -> f
                            .range(r -> r
                                .number(n -> n.field("deliveryTime").lte((double) finalDeliveryDays))
                            )
                        );
                    }

                    // Lọc theo price range
                    if (rq.getMinPrice() != null && rq.getMaxPrice() != null) {
                        b.filter(f -> f
                            .range(r -> r
                                .number(n -> n
                                    .field("price")
                                    .gte(rq.getMinPrice())
                                    .lte(rq.getMaxPrice())
                                )
                            )
                        );
                    }

                    return b;
                })
            )
            .withPageable(pageable)
            .build();

        SearchHits<GigDoc> searchHits = elasticsearchOperations.search(nativeQuery, GigDoc.class);

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
                        .build())
                .collect(Collectors.toList());
    }

    public List<Map<String, String>> getPopularCategoryNames() {
        List<Object[]> rawData = gigRepo.findPopularCategoryNames(PageRequest.of(0, 4));
        List<Map<String, String>> result = new ArrayList<>();
        for (Object[] row : rawData) {
            Map<String, String> category = new HashMap<>();
            category.put("name", (String) row[0]);
            category.put("categorySlug", (String) row[1]);
            result.add(category);
        }
        return result;
    }

    public GigDetailResponseDTO getDetailGig(Long gigId) {
        Gig gig = gigRepo.findGigById(gigId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gig với ID: " + gigId));
        GigDetailResponseDTO.SellerSummaryDTO sellerDTO = null;
        if (gig.getSeller() != null) {
            sellerDTO = GigDetailResponseDTO.SellerSummaryDTO.builder()
                    .id(gig.getSeller().getId())
                    .fullName(gig.getSeller().getUser().getFullname())
                    .avatarUrl(gig.getSeller().getUser().getAvatarUrl())
                    .role("FREELANCER")
                    .location(gig.getSeller().getUser().getCountry())
                    .build();
        }

        GigDetailResponseDTO.GigStatsDTO statsDTO = null;
        statsDTO = GigDetailResponseDTO.GigStatsDTO.builder()
                .rating(gig.getRatingAvg())
                .reviewCount(Integer.valueOf(10))
                .salesCount(Integer.valueOf(10))
                .viewsCount(Integer.valueOf(10))
                .build();

        List<GigDetailResponseDTO.PackageDTO> packageDTOs = new ArrayList<>();
        if (gig.getPackages() != null) {
            packageDTOs = gig.getPackages().stream()
                    .sorted(Comparator.comparing(GigPackages::getId))
                    .<GigDetailResponseDTO.PackageDTO>map(pkg -> {

                        Map<String, Boolean> featureMap = pkg.getFeatures() == null ? new HashMap<>()
                                : pkg.getFeatures().stream()
                                        .collect(Collectors.toMap(
                                                PackageFeature::getName,
                                                PackageFeature::getIsIncluded,
                                                (existing, replacement) -> existing));

                        return GigDetailResponseDTO.PackageDTO.builder()
                                .id(pkg.getId())
                                .type(pkg.getName())
                                .price(pkg.getPrice())
                                .shortDescription(pkg.getDescription())
                                .deliveryDays(pkg.getDeliveryDays())
                                .revisions(pkg.getRevisions() != null ? pkg.getRevisions() : 0)
                                .features(featureMap)
                                .build();

                    }).collect(Collectors.toList());
        }
        Gig gigImg = gigRepo.findGigWithImagesById(gigId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Gig với ID: " + gigId));
        List<String> gallery = gigImg.getGalleryUrls() != null ? gigImg.getGalleryUrls() : new ArrayList<>();
        
        GigDetailResponseDTO.MediaDTO mediaDTO = GigDetailResponseDTO.MediaDTO.builder()
                                    .mainImage(gig.getThumbnailUrl()) 
                                    .gallery(gallery)                
                                    .build();
        
        return GigDetailResponseDTO.builder()
                .id(gig.getId())
                .title(gig.getTitle())
                .description(gig.getDescription())
                .isFeatured(false)
                .stats(statsDTO)
                .seller(sellerDTO)
                .packages(packageDTOs)
                .media(mediaDTO)
                .build();
    }

    public Map<String, List<GigCardDTO>> getSimilarGigs(Long gigId) {
        Gig currentGig = gigRepo.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gig: " + gigId));

        List<Gig> similarGigs = gigRepo.findSimilarGigs(
                currentGig.getId(),
                currentGig.getCategory().getId(),
                PageRequest.of(0, 4)
        );

        List<GigCardDTO> content = similarGigs.stream().map(gig -> {
            BigDecimal startingPrice = BigDecimal.ZERO;
            String deliveryStr = "N/A";

            if (gig.getPackages() != null && !gig.getPackages().isEmpty()) {
                GigPackages cheapestPackage = gig.getPackages().stream()
                        .min(Comparator.comparing(GigPackages::getPrice))
                        .orElse(null);

                if (cheapestPackage != null) {
                    startingPrice = cheapestPackage.getPrice();
                    deliveryStr = cheapestPackage.getDeliveryDays() + " days";
                }
            }

            GigDetailResponseDTO.SellerSummaryDTO sellerDTO = null;
            if (gig.getSeller() != null) {
                sellerDTO = GigDetailResponseDTO.SellerSummaryDTO.builder()
                        .id(gig.getSeller().getId())
                        .fullName(gig.getSeller().getUser().getFullname())
                        .avatarUrl(gig.getSeller().getUser().getAvatarUrl())
                        .build();
            }

            GigDetailResponseDTO.GigStatsDTO statsDTO = GigDetailResponseDTO.GigStatsDTO.builder()
                    .rating(gig.getRatingAvg())
                    .reviewCount(gig.getTotalReviews())
                    .salesCount(0)
                    .viewsCount(0)
                    .build();

            return GigCardDTO.builder()
                    .id(gig.getId())
                    .thumbnailUrl(gig.getThumbnailUrl())
                    .isFeatured(false)
                    .title(gig.getTitle())
                    .stats(statsDTO)
                    .startingPrice(startingPrice)
                    .deliveryTimeStr(deliveryStr)
                    .seller(sellerDTO)
                    .isFavorite(false)
                    .build();
        }).collect(Collectors.toList());

        Map<String, List<GigCardDTO>> response = new HashMap<>();
        response.put("similarGigs", content);
        return response;
    }

    @Transactional
    public Long createGig(Long userId, GigCreateRequestDTO request) {
        
        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản này chưa đăng ký làm Người bán (Seller)!"));
        Category category = cateRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không hợp lệ!"));
        
        Gig newGig = new Gig();
        newGig.setTitle(request.getTitle());
        newGig.setDescription(request.getDescription());
        newGig.setSeller(seller); 
        newGig.setCategory(category);
        newGig.setThumbnailUrl(request.getThumbnailUrl());
        newGig.setGalleryUrls(request.getGalleryUrls());
        newGig.setSlug(generateSlug(request.getTitle()));
        newGig.setCreatedAt(LocalDateTime.now());
        newGig.setPrice(BigDecimal.ZERO);
        newGig.setDeliveryTime(0);
        newGig.setRatingAvg(0.0);
        if (request.getPackages() != null && !request.getPackages().isEmpty()) {
            Set<GigPackages> packagesToSave = request.getPackages().stream().map(pkgDto -> {
                GigPackages pkg = new GigPackages();
                pkg.setName(pkgDto.getType()); 
                pkg.setPrice(pkgDto.getPrice());
                pkg.setDescription(pkgDto.getShortDescription());
                pkg.setDeliveryDays(pkgDto.getDeliveryDays());
                pkg.setRevisions(pkgDto.getRevisions());
                pkg.setGig(newGig); 


                if (pkgDto.getFeatures() != null && !pkgDto.getFeatures().isEmpty()) {
                    Set<PackageFeature> features = pkgDto.getFeatures()
                        .entrySet()
                        .stream()
                        .map(entry -> {
                            PackageFeature feature = new PackageFeature();
                            feature.setName(entry.getKey());
                            feature.setIsIncluded(entry.getValue());
                            feature.setGigPackage(pkg);
                            return feature;
                        })
                        .collect(Collectors.toSet());

                    pkg.setFeatures(features);
                }
                return pkg;
            }).collect(Collectors.toSet());
            newGig.setPackages(packagesToSave);

            GigPackages basicPackage = packagesToSave.stream()
                    .filter(p -> "BASIC".equalsIgnoreCase(p.getName()))
                    .findFirst()
                    .orElse(null);
            if (basicPackage != null) {
                newGig.setPrice(basicPackage.getPrice());
                newGig.setDeliveryTime(basicPackage.getDeliveryDays());
            }
        }
        if (request.getRequirements() != null && !request.getRequirements().isEmpty()) {
            Set<GigRequirement> requirementsToSave = request.getRequirements().stream().map(reqDto -> {
                GigRequirement req = new GigRequirement();
                req.setQuestion(reqDto.getQuestion());
                req.setAnswerType(reqDto.getAnswerType() != null ? reqDto.getAnswerType() : "TEXT"); 
                req.setIsMandatory(reqDto.getIsMandatory() != null ? reqDto.getIsMandatory() : true);
                req.setGig(newGig); // Mapping quan hệ 2 chiều
                return req;
            }).collect(Collectors.toSet());
            
            newGig.setRequirements(requirementsToSave);
        }
        Gig savedGig = gigRepo.save(newGig);
        syncGigToElasTic(savedGig);
        return savedGig.getId();
    }
    public void deleteGig(Long gigId, Long currentSellerId) {
        Gig gig = gigRepo.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài dịch vụ này!"));
        if (!gig.getSeller().getId().equals(currentSellerId)) {
            throw new RuntimeException("Bạn không có quyền xóa bài dịch vụ của người khác!");
        }
        gigRepo.delete(gig);
        removeGigFromElastic(gigId);
    }
    private String generateSlug(String title) {
        if (title == null || title.isEmpty()) {
            return "gig-" + System.currentTimeMillis();
        }
        // Bỏ dấu tiếng Việt
        String temp = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(temp).replaceAll("").toLowerCase();
        
        // Thay thế ký tự đặc biệt và khoảng trắng thành dấu gạch ngang
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        
        // Gắn thêm 1 đoạn mã ngẫu nhiên (timestamp) ở đuôi để đảm bảo slug không bao giờ bị trùng lặp
        return slug + "-" + System.currentTimeMillis();
    }
}