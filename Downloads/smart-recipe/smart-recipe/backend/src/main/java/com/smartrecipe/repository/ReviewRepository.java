package com.smartrecipe.repository;

import com.smartrecipe.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRecipeId(Long recipeId);
    List<Review> findByUserId(Long userId);
    Optional<Review> findByRecipeIdAndUserId(Long recipeId, Long userId);
    boolean existsByRecipeIdAndUserId(Long recipeId, Long userId);
}
