package com.smartrecipe.service;

import com.smartrecipe.dto.*;
import com.smartrecipe.entity.*;
import com.smartrecipe.exception.BadRequestException;
import com.smartrecipe.exception.ResourceNotFoundException;
import com.smartrecipe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired private RecipeRepository recipeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SavedRecipeRepository savedRecipeRepository;

    public List<RecipeResponse> getAllRecipes(String currentUserEmail) {
        return recipeRepository.findAll().stream()
                .map(r -> mapToResponse(r, currentUserEmail))
                .collect(Collectors.toList());
    }

    public RecipeResponse getRecipeById(Long id, String currentUserEmail) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + id));
        return mapToResponse(recipe, currentUserEmail);
    }

    public List<RecipeResponse> searchRecipes(String keyword, String dietType, String cuisineType, String difficulty, String currentUserEmail) {
        return recipeRepository.searchWithFilters(keyword, dietType, cuisineType, difficulty)
                .stream().map(r -> mapToResponse(r, currentUserEmail))
                .collect(Collectors.toList());
    }

    @Transactional
    public RecipeResponse createRecipe(RecipeRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Recipe recipe = new Recipe();
        mapRequestToEntity(request, recipe);
        recipe.setUser(user);

        List<Ingredient> ingredients = new ArrayList<>();
        if (request.getIngredients() != null) {
            for (IngredientDTO dto : request.getIngredients()) {
                Ingredient ing = new Ingredient();
                ing.setName(dto.getName());
                ing.setQuantity(dto.getQuantity());
                ing.setUnit(dto.getUnit());
                ing.setRecipe(recipe);
                ingredients.add(ing);
            }
        }
        recipe.setIngredients(ingredients);

        List<RecipeStep> steps = new ArrayList<>();
        if (request.getSteps() != null) {
            for (RecipeStepDTO dto : request.getSteps()) {
                RecipeStep step = new RecipeStep();
                step.setStepNumber(dto.getStepNumber());
                step.setInstruction(dto.getInstruction());
                step.setRecipe(recipe);
                steps.add(step);
            }
        }
        recipe.setSteps(steps);

        Recipe saved = recipeRepository.save(recipe);
        return mapToResponse(saved, userEmail);
    }

    @Transactional
    public RecipeResponse updateRecipe(Long id, RecipeRequest request, String userEmail) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + id));

        if (!recipe.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("You are not authorized to update this recipe");
        }

        mapRequestToEntity(request, recipe);

        recipe.getIngredients().clear();
        if (request.getIngredients() != null) {
            for (IngredientDTO dto : request.getIngredients()) {
                Ingredient ing = new Ingredient();
                ing.setName(dto.getName());
                ing.setQuantity(dto.getQuantity());
                ing.setUnit(dto.getUnit());
                ing.setRecipe(recipe);
                recipe.getIngredients().add(ing);
            }
        }

        recipe.getSteps().clear();
        if (request.getSteps() != null) {
            for (RecipeStepDTO dto : request.getSteps()) {
                RecipeStep step = new RecipeStep();
                step.setStepNumber(dto.getStepNumber());
                step.setInstruction(dto.getInstruction());
                step.setRecipe(recipe);
                recipe.getSteps().add(step);
            }
        }

        return mapToResponse(recipeRepository.save(recipe), userEmail);
    }

    @Transactional
    public void deleteRecipe(Long id, String userEmail) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + id));
        if (!recipe.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("You are not authorized to delete this recipe");
        }
        recipeRepository.delete(recipe);
    }

    public List<RecipeResponse> getMyRecipes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return recipeRepository.findByUserId(user.getId())
                .stream().map(r -> mapToResponse(r, userEmail))
                .collect(Collectors.toList());
    }

    @Transactional
    public String toggleSaveRecipe(Long recipeId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        if (savedRecipeRepository.existsByUserIdAndRecipeId(user.getId(), recipeId)) {
            savedRecipeRepository.deleteByUserIdAndRecipeId(user.getId(), recipeId);
            return "Recipe unsaved";
        } else {
            SavedRecipe saved = new SavedRecipe();
            saved.setUser(user);
            saved.setRecipe(recipe);
            savedRecipeRepository.save(saved);
            return "Recipe saved";
        }
    }

    public List<RecipeResponse> getSavedRecipes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return savedRecipeRepository.findByUserId(user.getId())
                .stream().map(sr -> mapToResponse(sr.getRecipe(), userEmail))
                .collect(Collectors.toList());
    }

    // ── Mapper helpers ────────────────────────────────────────────────────────

    private void mapRequestToEntity(RecipeRequest req, Recipe recipe) {
        recipe.setTitle(req.getTitle());
        recipe.setDescription(req.getDescription());
        recipe.setCookTime(req.getCookTime());
        recipe.setServings(req.getServings());
        recipe.setDifficulty(req.getDifficulty());
        recipe.setCuisineType(req.getCuisineType());
        recipe.setDietType(req.getDietType());
        recipe.setImageUrl(req.getImageUrl());
        recipe.setCaloriesPerServing(req.getCaloriesPerServing());
    }

    RecipeResponse mapToResponse(Recipe recipe, String currentUserEmail) {
        RecipeResponse res = new RecipeResponse();
        res.setId(recipe.getId());
        res.setTitle(recipe.getTitle());
        res.setDescription(recipe.getDescription());
        res.setCookTime(recipe.getCookTime());
        res.setServings(recipe.getServings());
        res.setDifficulty(recipe.getDifficulty());
        res.setCuisineType(recipe.getCuisineType());
        res.setDietType(recipe.getDietType());
        res.setImageUrl(recipe.getImageUrl());
        res.setCaloriesPerServing(recipe.getCaloriesPerServing());
        res.setCreatedAt(recipe.getCreatedAt());
        res.setAuthorName(recipe.getUser() != null ? recipe.getUser().getName() : "Unknown");
        res.setAuthorId(recipe.getUser() != null ? recipe.getUser().getId() : null);

        Double avg = recipeRepository.findAverageRatingByRecipeId(recipe.getId());
        res.setAverageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        res.setReviewCount(recipeRepository.findReviewCountByRecipeId(recipe.getId()));

        if (currentUserEmail != null) {
            userRepository.findByEmail(currentUserEmail).ifPresent(user ->
                res.setSavedByCurrentUser(savedRecipeRepository.existsByUserIdAndRecipeId(user.getId(), recipe.getId()))
            );
        }

        if (recipe.getIngredients() != null) {
            res.setIngredients(recipe.getIngredients().stream().map(i -> {
                IngredientDTO dto = new IngredientDTO();
                dto.setId(i.getId()); dto.setName(i.getName());
                dto.setQuantity(i.getQuantity()); dto.setUnit(i.getUnit());
                return dto;
            }).collect(Collectors.toList()));
        }

        if (recipe.getSteps() != null) {
            res.setSteps(recipe.getSteps().stream()
                    .sorted((a, b) -> a.getStepNumber().compareTo(b.getStepNumber()))
                    .map(s -> {
                        RecipeStepDTO dto = new RecipeStepDTO();
                        dto.setId(s.getId()); dto.setStepNumber(s.getStepNumber());
                        dto.setInstruction(s.getInstruction());
                        return dto;
                    }).collect(Collectors.toList()));
        }
        return res;
    }
}
