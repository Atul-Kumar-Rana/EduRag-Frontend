package com.smartrecipe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IngredientDTO {
    private Long id;
    @NotBlank(message = "Ingredient name is required")
    private String name;
    private String quantity;
    private String unit;
}
