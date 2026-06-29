package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "gig_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "answer_type", nullable = false, length = 20)
    private String answerType; // "TEXT" hoặc "ATTACHMENT"

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id", nullable = false)
    @ToString.Exclude // Tránh lỗi vòng lặp vô hạn khi log/toString
    @EqualsAndHashCode.Exclude
    private Gig gig;
}
