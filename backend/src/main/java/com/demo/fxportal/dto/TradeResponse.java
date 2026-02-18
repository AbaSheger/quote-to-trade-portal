package com.demo.fxportal.dto;

import com.demo.fxportal.model.Trade;
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
public class TradeResponse {

    private UUID tradeId;
    private UUID quoteId;
    private String currencyPair;
    private Trade.Side side;
    private BigDecimal amount;
    private BigDecimal rate;
    private Trade.Status status;
    private LocalDateTime bookedAt;

    public static TradeResponse fromEntity(Trade trade) {
        return TradeResponse.builder()
                .tradeId(trade.getId())
                .quoteId(trade.getQuoteId())
                .currencyPair(trade.getCurrencyPair())
                .side(trade.getSide())
                .amount(trade.getAmount())
                .rate(trade.getRate())
                .status(trade.getStatus())
                .bookedAt(trade.getBookedAt())
                .build();
    }
}
