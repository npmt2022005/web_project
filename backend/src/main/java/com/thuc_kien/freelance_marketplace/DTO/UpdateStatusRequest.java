package com.thuc_kien.freelance_marketplace.DTO;

import javax.validation.constraints.NotNull;

public class UpdateStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus status;

    // Getters and Setters
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}