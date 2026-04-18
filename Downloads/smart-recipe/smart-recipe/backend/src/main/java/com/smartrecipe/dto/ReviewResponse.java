package com.smartrecipe.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String userName;
    private Long userId;
    private LocalDateTime createdAt;
}
