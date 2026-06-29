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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.deser.std.NumberDeserializers.BigDecimalDeserializer;
import com.thuc_kien.freelance_marketplace.DTO.CategoryDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigCardDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigCreateRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigDetailResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigFeaturedResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.SellerGigResponse;
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
    private final WalletRepository walletRepo;

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

    public void syncGigToElasTic(Gig gig) {
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
                case "Express 24h":
                    deliveryDays = 1;
                    break;
                case "Up to 3 days":
                    deliveryDays = 3;
                    break;
                case "Up to 7 days":
                    deliveryDays = 7;
                    break;
                default:
                    deliveryDays = null;
                    break;
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
                                                .fuzziness("AUTO")));
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
                                                                .collect(Collectors.toList())))));
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
                                                                .collect(Collectors.toList())))));
                            }

                            // Lọc theo deliveryTime
                            if (finalDeliveryDays != null) {
                                b.filter(f -> f
                                        .range(r -> r
                                                .number(n -> n.field("deliveryTime").lte((double) finalDeliveryDays))));
                            }

                            // Lọc theo price range
                            if (rq.getMinPrice() != null && rq.getMaxPrice() != null) {
                                b.filter(f -> f
                                        .range(r -> r
                                                .number(n -> n
                                                        .field("price")
                                                        .gte(rq.getMinPrice())
                                                        .lte(rq.getMaxPrice()))));
                            }

                            return b;
                        }))
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
                .reviewCount(gig.getTotalReviews())
                .salesCount(gig.getSalesCount())
                .build();

        List<GigDetailResponseDTO.PackageDTO> packageDTOs = new ArrayList<>();
        if (gig.getPackages() != null) {
            packageDTOs = gig.getPackages().stream()
                    .sorted(Comparator.comparing(GigPackages::getId)).<GigDetailResponseDTO.PackageDTO>map(pkg -> {

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
                PageRequest.of(0, 4));

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
                    .salesCount(gig.getSalesCount())
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

    private void validateSellerProfile(Seller seller) {
        // 1. Check thông tin User
        if (seller.getUser().getAvatarUrl() == null || seller.getUser().getAvatarUrl().isBlank())
            throw new RuntimeException("Vui lòng cập nhật Avatar trước khi tạo Gig!");
        if (seller.getUser().getCountry() == null || seller.getUser().getCountry().isBlank())
            throw new RuntimeException("Vui lòng cập nhật Quốc gia!");
        if (seller.getUser().getCity() == null || seller.getUser().getCity().isBlank())
            throw new RuntimeException("Vui lòng cập nhật Thành phố!");

        // 2. Check Bio
        if (seller.getBio() == null || seller.getBio().isBlank())
            throw new RuntimeException("Vui lòng cập nhật Bio (Mô tả bản thân)!");

        // 3. Check Education & Experience
        if (seller.getEducations() == null || seller.getEducations().isEmpty())
            throw new RuntimeException("Vui lòng thêm ít nhất 1 bằng cấp!");
        if (seller.getExperiences() == null || seller.getExperiences().isEmpty())
            throw new RuntimeException("Vui lòng thêm ít nhất 1 kinh nghiệm làm việc!");

        // 4. Check Wallet (Liên kết ngân hàng)
        var wallet = walletRepo.findByUserId(seller.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Ví thanh toán chưa được khởi tạo!"));
        if (wallet.getStripeAccountId() == null || wallet.getStripeAccountId().isBlank()) {
            throw new RuntimeException("Vui lòng liên kết tài khoản ngân hàng để nhận tiền!");
        }
    }

    
    public Long createGig(Long userId, GigCreateRequestDTO request) {

        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản này chưa đăng ký làm Người bán (Seller)!"));

        validateSellerProfile(seller);
        
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
        newGig.setUpdatedAt(LocalDateTime.now());
        newGig.setPrice(BigDecimal.ZERO);
        newGig.setDeliveryTime(0);
        newGig.setRatingAvg(0.0);

        if (request.getPackages() != null && !request.getPackages().isEmpty()) {
            // Sử dụng forEach để xử lý từng package và thêm trực tiếp vào Gig
            for (GigCreateRequestDTO.PackageRequestDTO pkgDto : request.getPackages()) {
                GigPackages pkg = new GigPackages();
                pkg.setName(pkgDto.getType());
                pkg.setPrice(pkgDto.getPrice());
                pkg.setDescription(pkgDto.getShortDescription());
                pkg.setDeliveryDays(pkgDto.getDeliveryDays());
                pkg.setRevisions(pkgDto.getRevisions());
    
                if (pkgDto.getFeatures() != null && !pkgDto.getFeatures().isEmpty()) {
                    Set<PackageFeature> features = pkgDto.getFeatures()
                            .entrySet()
                            .stream()
                            .map(entry -> new PackageFeature(entry.getKey(), entry.getValue(), pkg))
                            .collect(Collectors.toSet());
    
                    pkg.setFeatures(features);
                }
                // Thêm package vào Gig, thiết lập quan hệ hai chiều
                newGig.addPackage(pkg);
            }
    
            // Lấy package BASIC từ danh sách vừa được thêm vào newGig
            GigPackages basicPackage = newGig.getPackages().stream()
                    .filter(p -> "BASIC".equalsIgnoreCase(p.getName()))
                    .findFirst()
                    .orElse(null);
    
            if (basicPackage != null) {
                newGig.setPrice(basicPackage.getPrice());
                newGig.setDeliveryTime(basicPackage.getDeliveryDays());
            }
        }

        if (request.getRequirements() != null && !request.getRequirements().isEmpty()) {
            for (GigCreateRequestDTO.GigRequirementDTO reqDto : request.getRequirements()) {
                GigRequirement req = new GigRequirement();
                req.setQuestion(reqDto.getQuestion());
                req.setAnswerType(reqDto.getAnswerType() != null ? reqDto.getAnswerType() : "TEXT");
                req.setIsMandatory(reqDto.getIsMandatory() != null ? reqDto.getIsMandatory() : true);
                newGig.getRequirements().add(req);
                req.setGig(newGig);
            }
        }
        try {
            System.out.println(">>> 1. CHUẨN BỊ ÉP LƯU XUỐNG DB...");
            
            // Dùng saveAndFlush để ép Hibernate thi hành SQL ngay và luôn!
            Gig savedGig = gigRepo.saveAndFlush(newGig); 
            
            System.out.println(">>> 2. LƯU THÀNH CÔNG RỒI NHÉ!");

            // Đồng bộ tới Elasticsearch nhưng KHÔNG được phép phá vỡ transaction chính.
            // Nếu sync lỗi thì chỉ ghi log và tiếp tục trả về ID đã lưu.
            try {
                syncGigToElasTic(savedGig);
            } catch (Exception ex) {
                log.error("Failed to sync Gig to Elasticsearch (non-fatal). Gig id={}", savedGig.getId(), ex);
            }

            return savedGig.getId();
            
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("❌❌❌ LỖI RỒI! DATABASE TỪ CHỐI DỮ LIỆU CỦA BẠN:");
            System.err.println("Nguyên nhân: " + e.getMostSpecificCause().getMessage());
            throw new RuntimeException("Lỗi Database: " + e.getMostSpecificCause().getMessage());
            
        } catch (Exception e) {
            System.err.println("❌❌❌ LỖI KHÔNG XÁC ĐỊNH RỒI:");
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu dữ liệu: " + e.getMessage());
        }
    }

    @Transactional
    public Long updateGig(Long gigId, Long userId, GigCreateRequestDTO request) {
        // 1. Tìm Gig hiện có và xác thực quyền sở hữu
        Gig existingGig = gigRepo.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gig với ID: " + gigId));

        if (!existingGig.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa Gig này!");
        }

        // 2. Cập nhật các trường thông tin cơ bản
        Category category = cateRepo.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không hợp lệ!"));

        existingGig.setTitle(request.getTitle());
        existingGig.setDescription(request.getDescription());
        existingGig.setCategory(category);
        existingGig.setThumbnailUrl(request.getThumbnailUrl());
        existingGig.setGalleryUrls(request.getGalleryUrls());
        existingGig.setUpdatedAt(LocalDateTime.now());

        // Nếu tiêu đề thay đổi, tạo slug mới để tránh trùng lặp
        if (!existingGig.getTitle().equals(request.getTitle())) {
            existingGig.setSlug(generateSlug(request.getTitle()));
        }

        // 3. Cập nhật danh sách các gói (Packages) - Logic phức tạp
        updatePackages(existingGig, request.getPackages());

        // 4. Cập nhật danh sách các yêu cầu (Requirements)
        updateRequirements(existingGig, request.getRequirements());

        // 5. Cập nhật lại giá và thời gian giao hàng cơ bản dựa trên gói BASIC
        GigPackages basicPackage = existingGig.getPackages().stream()
                .filter(p -> "BASIC".equalsIgnoreCase(p.getName()))
                .findFirst()
                .orElse(null);
        if (basicPackage != null) {
            existingGig.setPrice(basicPackage.getPrice());
            existingGig.setDeliveryTime(basicPackage.getDeliveryDays());
        }

        // 6. Lưu Gig đã cập nhật và đồng bộ sang Elasticsearch
        Gig updatedGig = gigRepo.save(existingGig);
        syncGigToElasTic(updatedGig);

        return updatedGig.getId();
    }

    private void updatePackages(Gig gig, Set<GigCreateRequestDTO.PackageRequestDTO> requestPackages) {
        Map<Long, GigCreateRequestDTO.PackageRequestDTO> requestPackageMap = requestPackages.stream()
                .filter(p -> p.getId() != null)
                .collect(Collectors.toMap(GigCreateRequestDTO.PackageRequestDTO::getId, p -> p));

        // 1. Xóa các package không còn trong request
        gig.getPackages().removeIf(existingPkg -> !requestPackageMap.containsKey(existingPkg.getId()));

        for (GigCreateRequestDTO.PackageRequestDTO requestPkgDto : requestPackages) {
            GigPackages packageEntity;
            if (requestPkgDto.getId() != null) {
                // Cập nhật package đã có
                packageEntity = gig.getPackages().stream()
                        .filter(p -> p.getId().equals(requestPkgDto.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Package with id " + requestPkgDto.getId() + " not found for this gig."));
            } else {
                packageEntity = new GigPackages();
                packageEntity.setGig(gig);
                gig.getPackages().add(packageEntity);
            }

            // Map dữ liệu từ DTO sang Entity
            packageEntity.setName(requestPkgDto.getType());
            packageEntity.setPrice(requestPkgDto.getPrice());
            packageEntity.setDescription(requestPkgDto.getShortDescription());
            packageEntity.setDeliveryDays(requestPkgDto.getDeliveryDays());
            packageEntity.setRevisions(requestPkgDto.getRevisions());

            // Cập nhật features
            packageEntity.getFeatures().clear();
            requestPkgDto.getFeatures().forEach((name, included) -> {
                PackageFeature feature = new PackageFeature(name, included, packageEntity); // Dòng này giờ đã hợp lệ
                packageEntity.getFeatures().add(feature);
            });
        }
    }

    private void updateRequirements(Gig gig, Set<GigCreateRequestDTO.GigRequirementDTO> requirementDtos) {
        if (requirementDtos == null) {
            gig.getRequirements().clear();
            return;
        }

        Map<Long, GigCreateRequestDTO.GigRequirementDTO> requestDtoMap = requirementDtos.stream()
                .filter(dto -> dto.getId() != null)
                .collect(Collectors.toMap(GigCreateRequestDTO.GigRequirementDTO::getId, dto -> dto));

        // 1. Xóa các requirement không còn trong request mới
        gig.getRequirements().removeIf(req -> !requestDtoMap.containsKey(req.getId()));

        // 2. Cập nhật hoặc thêm mới
        for (GigCreateRequestDTO.GigRequirementDTO dto : requirementDtos) {
            GigRequirement requirementEntity;
            if (dto.getId() != null) {
                // Cập nhật requirement đã có
                requirementEntity = gig.getRequirements().stream()
                        .filter(r -> r.getId().equals(dto.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Requirement with id " + dto.getId() + " not found for this gig."));
            } else {
                // Thêm requirement mới
                requirementEntity = new GigRequirement();
                requirementEntity.setGig(gig);
                gig.getRequirements().add(requirementEntity);
            }
            requirementEntity.setQuestion(dto.getQuestion());
            requirementEntity.setAnswerType(dto.getAnswerType());
            requirementEntity.setIsMandatory(dto.getIsMandatory());
        }
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

        // Gắn thêm 1 đoạn mã ngẫu nhiên (timestamp) ở đuôi để đảm bảo slug không bao
        // giờ bị trùng lặp
        return slug + "-" + System.currentTimeMillis();
    }

    @Transactional
    public Page<SellerGigResponse> getGigsBySeller(Long sellerId, Pageable pageable) {
        Page<Gig> gigPage = gigRepo.findBySellerId(sellerId, pageable);

        return gigPage.map(this::mapToSellerGigResponse);
    }

    // Hàm Helper để Map dữ liệu và tính toán
    private SellerGigResponse mapToSellerGigResponse(Gig gig) {
        BigDecimal minPrice = gig.getPackages().stream()
                .map(GigPackages::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        Integer minDeliveryDays = gig.getPackages().stream()
                .map(GigPackages::getDeliveryDays)
                .min(Integer::compareTo)
                .orElse(0);
        String generatedGigCode = "#GIG-" + gig.getId();

        return SellerGigResponse.builder()
                .id(gig.getId())
                .gigCode(generatedGigCode)
                .thumbnailUrl(gig.getThumbnailUrl())
                .title(gig.getTitle())
                .categoryName(gig.getCategory().getName())
                .startingPrice(minPrice)
                .deliveryDays(minDeliveryDays)
                .build();
    }
}