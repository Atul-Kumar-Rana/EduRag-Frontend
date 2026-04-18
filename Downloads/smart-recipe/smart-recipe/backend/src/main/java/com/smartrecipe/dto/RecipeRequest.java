package com.smartrecipe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RecipeRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String cookTime;
    private String servings;
    private String difficulty;
    private String cuisineType;
    private String dietType;
    private String imageUrl;
    private Integer caloriesPerServing;
    private List<IngredientDTO> ingredients;
    private List<RecipeStepDTO> steps;
}
