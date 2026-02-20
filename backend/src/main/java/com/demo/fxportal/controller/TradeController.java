package com.demo.fxportal.controller;

import com.demo.fxportal.dto.TradeRequest;
import com.demo.fxportal.dto.TradeResponse;
import com.demo.fxportal.model.Side;
import com.demo.fxportal.model.Trade;
import com.demo.fxportal.service.TradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
@Validated
@Tag(name = "Trades", description = "FX Trade API")
public class TradeController {

    private final TradeService tradeService;

    @PostMapping
    @Operation(summary = "Book a trade", description = "Books a trade based on a valid quote ID")
    public ResponseEntity<TradeResponse> bookTrade(@Valid @RequestBody TradeRequest request) {
        TradeResponse response = tradeService.bookTrade(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get trade history", description = "Retrieves trade history with optional filters")
    public ResponseEntity<Page<TradeResponse>> getTradeHistory(
            @Parameter(description = "Filter by currency pair (e.g., EUR/USD)")
            @RequestParam(required = false) Optional<String> currencyPair,

            @Parameter(description = "Filter by side (BUY or SELL)")
            @RequestParam(required = false) Optional<Side> side,

            @Parameter(description = "Filter by status (BOOKED, SETTLED, CANCELLED)")
            @RequestParam(required = false) Optional<Trade.Status> status,

            @Parameter(description = "Filter by from date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> fromDate,

            @Parameter(description = "Filter by to date (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Optional<LocalDateTime> toDate,

            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") @Min(0) int page,

            @Parameter(description = "Page size (1-100)")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,

            @Parameter(description = "Sort by field")
            @RequestParam(defaultValue = "bookedAt") String sortBy,

            @Parameter(description = "Sort direction (ASC or DESC)")
            @RequestParam(defaultValue = "DESC") Sort.Direction direction
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<TradeResponse> trades = tradeService.getTradeHistory(
                currencyPair, side, status, fromDate, toDate, pageable);
        return ResponseEntity.ok(trades);
    }
}
