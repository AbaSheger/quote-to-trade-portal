package com.demo.fxportal.controller;

import com.demo.fxportal.dto.QuoteRequest;
import com.demo.fxportal.dto.QuoteResponse;
import com.demo.fxportal.service.QuoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Quotes", description = "FX Quote API")
public class QuoteController {

    private final QuoteService quoteService;

    @PostMapping
    @Operation(summary = "Request a new FX quote", description = "Creates a new quote with a rate that expires after 30 seconds")
    public ResponseEntity<QuoteResponse> requestQuote(@Valid @RequestBody QuoteRequest request) {
        QuoteResponse response = quoteService.requestQuote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
