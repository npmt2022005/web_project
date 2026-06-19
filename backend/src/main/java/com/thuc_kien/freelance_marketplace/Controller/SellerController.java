package com.thuc_kien.freelance_marketplace.Controller;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.SellerDetailDTO;
import com.thuc_kien.freelance_marketplace.DTO.SellerProfileResponse;
import com.thuc_kien.freelance_marketplace.Service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sellers")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    @GetMapping
    public ResponseEntity<APIResponse<List<SellerProfileResponse>>> getAllSellers() {
        List<SellerProfileResponse> sellers = sellerService.getAllPublicSellers();
        APIResponse<List<SellerProfileResponse>> response = APIResponse.<List<SellerProfileResponse>>builder()
                .status("success")
                .message("Lấy danh sách người bán thành công.")
                .data(sellers)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<SellerDetailDTO>> getSellerDetail(@PathVariable Long id) {
        SellerDetailDTO seller = sellerService.getSellerById(id);
        APIResponse<SellerDetailDTO> response = new APIResponse<>();
        response.setStatus("success");
        response.setData(seller);
        response.setMessage("Đã lấy thành công thông tin seller");
        return ResponseEntity.ok(response);
    }
}