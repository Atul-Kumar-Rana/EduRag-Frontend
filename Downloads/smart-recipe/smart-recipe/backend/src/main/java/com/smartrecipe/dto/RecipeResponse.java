package com.smartrecipe.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RecipeResponse {
    private Long id;
    private String title;
    private String description;
    private String cookTime;
    private String servings;
    private String difficulty;
    private String cuisineType;
    private String dietType;
    private String imageUrl;
    private Integer caloriesPerServing;
    private LocalDateTime createdAt;
    private String authorName;
    private Long authorId;
    private List<IngredientDTO> ingredients;
    private List<RecipeStepDTO> steps;
    private Double averageRating;
    private Integer reviewCount;
    private boolean savedByCurrentUser;
}
