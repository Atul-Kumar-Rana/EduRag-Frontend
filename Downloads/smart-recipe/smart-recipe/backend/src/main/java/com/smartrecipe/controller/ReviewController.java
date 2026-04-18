package com.smartrecipe.controller;

import com.smartrecipe.dto.ReviewRequest;
import com.smartrecipe.dto.ReviewResponse;
import com.smartrecipe.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes/{recipeId}/reviews")
@Tag(name = "Reviews", description = "Recipe review APIs")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all reviews for a recipe")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long recipeId) {
        return ResponseEntity.ok(reviewService.getReviewsForRecipe(recipeId));
    }

    @PostMapping
    @Operation(summary = "Add a review", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long recipeId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(recipeId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete a review", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long recipeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(reviewId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }
}
