package com.smartrecipe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecipeStepDTO {
    private Long id;
    @NotNull(message = "Step number is required")
    private Integer stepNumber;
    @NotBlank(message = "Instruction is required")
    private String instruction;
}
