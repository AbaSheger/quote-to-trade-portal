package com.demo.fxportal.service;

import com.demo.fxportal.dto.QuoteRequest;
import com.demo.fxportal.dto.QuoteResponse;
import com.demo.fxportal.model.Quote;
import com.demo.fxportal.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final Random random = new Random();

    @Transactional
    public QuoteResponse requestQuote(QuoteRequest request) {
        log.info("Requesting quote for {} {} {}", request.getCurrencyPair(), request.getSide(), request.getAmount());

        // Generate a simulated rate (in real system, would fetch from market data provider)
        BigDecimal rate = generateSimulatedRate(request.getCurrencyPair());

        // Quote expires in 2 minutes
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(2);

        Quote quote = Quote.builder()
                .currencyPair(request.getCurrencyPair())
                .side(request.getSide())
                .amount(request.getAmount())
                .rate(rate)
                .expiresAt(expiresAt)
                .build();

        quote = quoteRepository.save(quote);
        log.info("Quote created with ID: {}", quote.getId());

        return QuoteResponse.fromEntity(quote);
    }

    private BigDecimal generateSimulatedRate(String currencyPair) {
        // Simulated base rates for common currency pairs
        BigDecimal baseRate;
        switch (currencyPair) {
            case "EUR/USD":
                baseRate = new BigDecimal("1.0850");
                break;
            case "GBP/USD":
                baseRate = new BigDecimal("1.2650");
                break;
            case "USD/JPY":
                baseRate = new BigDecimal("149.50");
                break;
            case "USD/CHF":
                baseRate = new BigDecimal("0.8750");
                break;
            case "AUD/USD":
                baseRate = new BigDecimal("0.6550");
                break;
            default:
                baseRate = new BigDecimal("1.0000");
                break;
        }

        // Add random spread (-0.5% to +0.5%)
        double spreadPercent = (random.nextDouble() - 0.5) * 0.01;
        BigDecimal spread = baseRate.multiply(BigDecimal.valueOf(spreadPercent));

        return baseRate.add(spread).setScale(6, RoundingMode.HALF_UP);
    }
}
