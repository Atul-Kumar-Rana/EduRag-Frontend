package com.smartrecipe.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "AI-powered recipe generation via Gemini")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    @PostMapping("/generate-recipe")
    @Operation(summary = "Generate a recipe using Gemini AI (login required)")
    public ResponseEntity<Map<String, Object>> generateRecipe(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        // ── Auth check ────────────────────────────────────────────────────────
        if (userDetails == null) {
            return error(HttpStatus.UNAUTHORIZED, "Please login to use the AI Recipe Generator.");
        }

        // ── Input validation ──────────────────────────────────────────────────
        String ingredients = body.getOrDefault("ingredients", "").trim();
        if (ingredients.isEmpty()) {
            return error(HttpStatus.BAD_REQUEST, "Please select at least one ingredient.");
        }
        String dietType = body.getOrDefault("dietType", "Any");
        String cookTime = body.getOrDefault("cookTime", "30 min");

        // ── API key check ─────────────────────────────────────────────────────
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            log.error("Gemini API key not configured!");
            return error(HttpStatus.INTERNAL_SERVER_ERROR,
                "AI service not configured. Please set gemini.api.key in application.properties.");
        }

        // ── Build prompt ──────────────────────────────────────────────────────
        String diet = dietType.equals("Any") ? "" : dietType + " ";
        String prompt =
            "You are a professional chef. Create a " + diet +
            "recipe using ONLY these ingredients: " + ingredients + ". " +
            "Cooking time should be around: " + cookTime + ". " +
            "You MUST respond with ONLY a raw JSON object. " +
            "No markdown, no code blocks, no explanation, no extra text. " +
            "The JSON must have exactly these fields:\n" +
            "{" +
            "\"title\": \"string\"," +
            "\"description\": \"one sentence about the dish\"," +
            "\"time\": \"string like 30 mins\"," +
            "\"servings\": \"string like 2-3\"," +
            "\"difficulty\": \"Easy or Medium or Hard\"," +
            "\"calories\": \"number as string\"," +
            "\"protein\": \"grams as string\"," +
            "\"carbs\": \"grams as string\"," +
            "\"fat\": \"grams as string\"," +
            "\"ingredients\": [\"quantity + ingredient name\"]," +
            "\"steps\": [\"full step instruction\"]," +
            "\"tip\": \"one helpful cooking tip\"" +
            "}";

        // ── Call Gemini ───────────────────────────────────────────────────────
        try {
            Map<String, Object> part        = Map.of("text", prompt);
            Map<String, Object> content     = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders  headers      = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = GEMINI_URL + geminiApiKey;

            log.info("Calling Gemini API for user: {}", userDetails.getUsername());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            // ── Parse Gemini response ─────────────────────────────────────────
            Map<?, ?> resBody   = response.getBody();
            if (resBody == null) return error(HttpStatus.INTERNAL_SERVER_ERROR, "Empty response from Gemini.");

            List<?> candidates  = (List<?>) resBody.get("candidates");
            if (candidates == null || candidates.isEmpty())
                return error(HttpStatus.INTERNAL_SERVER_ERROR, "No candidates returned from Gemini.");

            Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> contentMap = (Map<?, ?>) candidate.get("content");
            List<?> parts       = (List<?>) contentMap.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            String generatedText = (String) firstPart.get("text");

            // ── Clean up the text ─────────────────────────────────────────────
            generatedText = generatedText
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();

            // ── Validate it's proper JSON ─────────────────────────────────────
            ObjectMapper mapper = new ObjectMapper();
            Map<?, ?> recipeJson = mapper.readValue(generatedText, Map.class);

            log.info("Recipe generated successfully for user: {}", userDetails.getUsername());
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("recipe", recipeJson);
            return ResponseEntity.ok(result);

        } catch (HttpClientErrorException e) {
            log.error("Gemini HTTP error: {} — {}", e.getStatusCode(), e.getResponseBodyAsString());
            String msg = e.getStatusCode().value() == 400
                ? "Bad request to Gemini. Check your API key."
                : e.getStatusCode().value() == 403
                ? "Gemini API key is invalid or has no access. Get a free key at aistudio.google.com"
                : "Gemini API error: " + e.getStatusCode();
            return error(HttpStatus.BAD_GATEWAY, msg);

        } catch (ResourceAccessException e) {
            log.error("Network error reaching Gemini: {}", e.getMessage());
            return error(HttpStatus.SERVICE_UNAVAILABLE, "Cannot reach Gemini API. Check your internet connection.");

        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Failed to parse Gemini JSON response: {}", e.getMessage());
            return error(HttpStatus.INTERNAL_SERVER_ERROR,
                "Gemini returned invalid JSON. Please try again.");

        } catch (Exception e) {
            log.error("Unexpected error in AI generation: {}", e.getMessage(), e);
            return error(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}
