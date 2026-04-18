package com.smartrecipe.controller;

import com.smartrecipe.dto.RecipeRequest;
import com.smartrecipe.dto.RecipeResponse;
import com.smartrecipe.service.RecipeService;
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
@RequestMapping("/api/recipes")
@Tag(name = "Recipes", description = "Recipe management APIs")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @GetMapping
    @Operation(summary = "Get all recipes")
    public ResponseEntity<List<RecipeResponse>> getAllRecipes(
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(recipeService.getAllRecipes(email));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recipe by ID")
    public ResponseEntity<RecipeResponse> getRecipeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(recipeService.getRecipeById(id, email));
    }

    @GetMapping("/search")
    @Operation(summary = "Search and filter recipes")
    public ResponseEntity<List<RecipeResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String dietType,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String difficulty,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(recipeService.searchRecipes(keyword, dietType, cuisineType, difficulty, email));
    }

    @PostMapping
    @Operation(summary = "Create a new recipe", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<RecipeResponse> createRecipe(
            @Valid @RequestBody RecipeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recipeService.createRecipe(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a recipe", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<RecipeResponse> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a recipe", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> deleteRecipe(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        recipeService.deleteRecipe(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Recipe deleted successfully"));
    }

    @GetMapping("/my-recipes")
    @Operation(summary = "Get current user's recipes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<RecipeResponse>> getMyRecipes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(recipeService.getMyRecipes(userDetails.getUsername()));
    }

    @PostMapping("/{id}/save")
    @Operation(summary = "Save or unsave a recipe", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, String>> toggleSave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String msg = recipeService.toggleSaveRecipe(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @GetMapping("/saved")
    @Operation(summary = "Get saved recipes", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<RecipeResponse>> getSavedRecipes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(recipeService.getSavedRecipes(userDetails.getUsername()));
    }
}
