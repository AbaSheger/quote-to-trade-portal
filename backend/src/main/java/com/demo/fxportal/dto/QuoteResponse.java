package com.demo.fxportal.dto;

import com.demo.fxportal.model.Quote;
import com.demo.fxportal.model.Side;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponse {

    private UUID quoteId;
    private String currencyPair;
    private Side side;
    private BigDecimal amount;
    private BigDecimal rate;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public static QuoteResponse fromEntity(Quote quote) {
        return QuoteResponse.builder()
                .quoteId(quote.getId())
                .currencyPair(quote.getCurrencyPair())
                .side(quote.getSide())
                .amount(quote.getAmount())
                .rate(quote.getRate())
                .expiresAt(quote.getExpiresAt())
                .createdAt(quote.getCreatedAt())
                .build();
    }
}
