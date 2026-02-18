package com.demo.fxportal.service;

import com.demo.fxportal.dto.QuoteRequest;
import com.demo.fxportal.dto.QuoteResponse;
import com.demo.fxportal.model.Quote;
import com.demo.fxportal.repository.QuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuoteServiceTest {

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private QuoteService quoteService;

    private QuoteRequest quoteRequest;
    private Quote savedQuote;

    @BeforeEach
    void setUp() {
        quoteRequest = QuoteRequest.builder()
                .currencyPair("EUR/USD")
                .side(Quote.Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .build();

        savedQuote = Quote.builder()
                .id(UUID.randomUUID())
                .currencyPair("EUR/USD")
                .side(Quote.Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .rate(new BigDecimal("1.0850"))
                .expiresAt(LocalDateTime.now().plusSeconds(30))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void requestQuote_shouldCreateAndReturnQuote() {
        // Given
        when(quoteRepository.save(any(Quote.class))).thenReturn(savedQuote);

        // When
        QuoteResponse response = quoteService.requestQuote(quoteRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getQuoteId()).isEqualTo(savedQuote.getId());
        assertThat(response.getCurrencyPair()).isEqualTo("EUR/USD");
        assertThat(response.getSide()).isEqualTo(Quote.Side.BUY);
        assertThat(response.getAmount()).isEqualTo(new BigDecimal("10000.00"));
        assertThat(response.getRate()).isNotNull();
        assertThat(response.getExpiresAt()).isNotNull();

        verify(quoteRepository, times(1)).save(any(Quote.class));
    }

    @Test
    void requestQuote_shouldGenerateRateForEurUsd() {
        // Given
        when(quoteRepository.save(any(Quote.class))).thenReturn(savedQuote);

        // When
        QuoteResponse response = quoteService.requestQuote(quoteRequest);

        // Then
        assertThat(response.getRate()).isNotNull();
        assertThat(response.getRate()).isGreaterThan(BigDecimal.ZERO);
    }
}
