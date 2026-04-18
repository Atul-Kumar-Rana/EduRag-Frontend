package com.smartrecipe.service;

import com.smartrecipe.dto.ReviewRequest;
import com.smartrecipe.dto.ReviewResponse;
import com.smartrecipe.entity.Recipe;
import com.smartrecipe.entity.Review;
import com.smartrecipe.entity.User;
import com.smartrecipe.exception.BadRequestException;
import com.smartrecipe.exception.ResourceNotFoundException;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.ReviewRepository;
import com.smartrecipe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private RecipeRepository recipeRepository;
    @Autowired private UserRepository userRepository;

    public List<ReviewResponse> getReviewsForRecipe(Long recipeId) {
        return reviewRepository.findByRecipeId(recipeId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ReviewResponse addReview(Long recipeId, ReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        if (reviewRepository.existsByRecipeIdAndUserId(recipeId, user.getId())) {
            throw new BadRequestException("You have already reviewed this recipe");
        }

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUser(user);
        review.setRecipe(recipe);

        return mapToResponse(reviewRepository.save(review));
    }

    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (!review.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Not authorized to delete this review");
        }
        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse res = new ReviewResponse();
        res.setId(review.getId());
        res.setRating(review.getRating());
        res.setComment(review.getComment());
        res.setUserName(review.getUser().getName());
        res.setUserId(review.getUser().getId());
        res.setCreatedAt(review.getCreatedAt());
        return res;
    }
}
