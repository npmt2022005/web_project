package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyerDeliveryViewResponse {
    private Long orderId;
    private String status;
    
    // Thông tin sản phẩm do Seller nộp
    private String submissionLink;    // Link file sản phẩm (Drive/Firebase...)
    private String submissionFileUrl; // URL file đã upload trực tiếp
    private String submissionNote;    // Lời nhắn gửi kèm của Seller
    
    // Thời hạn và số lượt chỉnh sửa
    private LocalDateTime inspectionDeadline; // Hạn chót để Buyer bấm nghiệm thu tự động
    private Integer revisionCount;            // Số lần Buyer đã yêu cầu sửa đổi
    private Integer maxRevisionsAllowed;      // Số lần sửa đổi tối đa của gói dịch vụ
}
