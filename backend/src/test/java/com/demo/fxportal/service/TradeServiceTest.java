package com.demo.fxportal.service;

import com.demo.fxportal.dto.TradeRequest;
import com.demo.fxportal.dto.TradeResponse;
import com.demo.fxportal.model.Quote;
import com.demo.fxportal.model.Side;
import com.demo.fxportal.model.Trade;
import com.demo.fxportal.repository.QuoteRepository;
import com.demo.fxportal.repository.TradeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private TradeService tradeService;

    private UUID quoteId;
    private Quote validQuote;
    private Quote expiredQuote;
    private Trade savedTrade;

    @BeforeEach
    void setUp() {
        quoteId = UUID.randomUUID();

        validQuote = Quote.builder()
                .id(quoteId)
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .rate(new BigDecimal("1.0850"))
                .expiresAt(LocalDateTime.now().plusSeconds(30))
                .createdAt(LocalDateTime.now())
                .build();

        expiredQuote = Quote.builder()
                .id(quoteId)
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .rate(new BigDecimal("1.0850"))
                .expiresAt(LocalDateTime.now().minusSeconds(1))
                .createdAt(LocalDateTime.now().minusSeconds(31))
                .build();

        savedTrade = Trade.builder()
                .id(UUID.randomUUID())
                .quoteId(quoteId)
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .rate(new BigDecimal("1.0850"))
                .status(Trade.Status.BOOKED)
                .bookedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void bookTrade_withValidQuote_shouldCreateTrade() {
        // Given
        TradeRequest request = TradeRequest.builder().quoteId(quoteId).build();
        when(quoteRepository.findById(quoteId)).thenReturn(Optional.of(validQuote));
        when(tradeRepository.save(any(Trade.class))).thenReturn(savedTrade);

        // When
        TradeResponse response = tradeService.bookTrade(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getQuoteId()).isEqualTo(quoteId);
        assertThat(response.getCurrencyPair()).isEqualTo("EUR/USD");
        assertThat(response.getSide()).isEqualTo(Side.BUY);
        assertThat(response.getAmount()).isEqualTo(new BigDecimal("10000.00"));
        assertThat(response.getStatus()).isEqualTo(Trade.Status.BOOKED);

        verify(quoteRepository, times(1)).findById(quoteId);
        verify(tradeRepository, times(1)).save(any(Trade.class));
    }

    @Test
    void bookTrade_withNonExistentQuote_shouldThrowException() {
        // Given
        TradeRequest request = TradeRequest.builder().quoteId(quoteId).build();
        when(quoteRepository.findById(quoteId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> tradeService.bookTrade(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Quote not found");

        verify(quoteRepository, times(1)).findById(quoteId);
        verify(tradeRepository, never()).save(any(Trade.class));
    }

    @Test
    void bookTrade_withExpiredQuote_shouldThrowException() {
        // Given
        TradeRequest request = TradeRequest.builder().quoteId(quoteId).build();
        when(quoteRepository.findById(quoteId)).thenReturn(Optional.of(expiredQuote));

        // When & Then
        assertThatThrownBy(() -> tradeService.bookTrade(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Quote has expired");

        verify(quoteRepository, times(1)).findById(quoteId);
        verify(tradeRepository, never()).save(any(Trade.class));
    }

    @Test
    void bookTrade_withAlreadyBookedQuote_shouldThrowException() {
        // Given
        TradeRequest request = TradeRequest.builder().quoteId(quoteId).build();
        when(quoteRepository.findById(quoteId)).thenReturn(Optional.of(validQuote));
        when(tradeRepository.existsByQuoteId(quoteId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> tradeService.bookTrade(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("A trade has already been booked for this quote");

        verify(tradeRepository, never()).save(any(Trade.class));
    }

    @Test
    void bookTrade_withValidQuote_shouldCopyAllFieldsFromQuote() {
        // Given
        TradeRequest request = TradeRequest.builder().quoteId(quoteId).build();
        when(quoteRepository.findById(quoteId)).thenReturn(Optional.of(validQuote));
        when(tradeRepository.save(any(Trade.class))).thenReturn(savedTrade);

        // When
        tradeService.bookTrade(request);

        // Then — verify the saved trade picks up all fields from the quote
        verify(tradeRepository).save(argThat(trade ->
                trade.getQuoteId().equals(quoteId) &&
                trade.getCurrencyPair().equals("EUR/USD") &&
                trade.getSide() == Side.BUY &&
                trade.getAmount().compareTo(new BigDecimal("10000.00")) == 0 &&
                trade.getRate().compareTo(new BigDecimal("1.0850")) == 0
        ));
    }
}
