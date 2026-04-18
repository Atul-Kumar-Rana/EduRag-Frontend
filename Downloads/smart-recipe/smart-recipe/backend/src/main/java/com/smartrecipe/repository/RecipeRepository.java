package com.smartrecipe.repository;

import com.smartrecipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByUserId(Long userId);

    List<Recipe> findByDietTypeIgnoreCase(String dietType);

    List<Recipe> findByCuisineTypeIgnoreCase(String cuisineType);

    List<Recipe> findByDifficultyIgnoreCase(String difficulty);

    @Query("SELECT r FROM Recipe r WHERE " +
           "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.cuisineType) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Recipe> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT r FROM Recipe r WHERE " +
           "(:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:dietType IS NULL OR LOWER(r.dietType) = LOWER(:dietType)) AND " +
           "(:cuisineType IS NULL OR LOWER(r.cuisineType) = LOWER(:cuisineType)) AND " +
           "(:difficulty IS NULL OR LOWER(r.difficulty) = LOWER(:difficulty))")
    List<Recipe> searchWithFilters(
            @Param("keyword") String keyword,
            @Param("dietType") String dietType,
            @Param("cuisineType") String cuisineType,
            @Param("difficulty") String difficulty);

    @Query("SELECT AVG(rv.rating) FROM Review rv WHERE rv.recipe.id = :recipeId")
    Double findAverageRatingByRecipeId(@Param("recipeId") Long recipeId);

    @Query("SELECT COUNT(rv) FROM Review rv WHERE rv.recipe.id = :recipeId")
    Integer findReviewCountByRecipeId(@Param("recipeId") Long recipeId);
}
