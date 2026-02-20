package com.demo.fxportal.controller;

import com.demo.fxportal.dto.QuoteRequest;
import com.demo.fxportal.dto.QuoteResponse;
import com.demo.fxportal.model.Side;
import com.demo.fxportal.service.QuoteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuoteController.class)
class QuoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QuoteService quoteService;

    private QuoteResponse buildQuoteResponse() {
        return QuoteResponse.builder()
                .quoteId(UUID.randomUUID())
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .rate(new BigDecimal("1.085000"))
                .expiresAt(LocalDateTime.now().plusMinutes(2))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void requestQuote_withValidRequest_shouldReturn201() throws Exception {
        QuoteRequest request = QuoteRequest.builder()
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .build();

        when(quoteService.requestQuote(any())).thenReturn(buildQuoteResponse());

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.currencyPair").value("EUR/USD"))
                .andExpect(jsonPath("$.side").value("BUY"))
                .andExpect(jsonPath("$.quoteId").exists())
                .andExpect(jsonPath("$.rate").exists())
                .andExpect(jsonPath("$.expiresAt").exists());
    }

    @Test
    void requestQuote_withMissingCurrencyPair_shouldReturn400() throws Exception {
        String body = "{\"side\":\"BUY\",\"amount\":10000}";

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.currencyPair").exists());
    }

    @Test
    void requestQuote_withInvalidCurrencyPairFormat_shouldReturn400() throws Exception {
        QuoteRequest request = QuoteRequest.builder()
                .currencyPair("EURUSD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .build();

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.currencyPair").exists());
    }

    @Test
    void requestQuote_withZeroAmount_shouldReturn400() throws Exception {
        QuoteRequest request = QuoteRequest.builder()
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(BigDecimal.ZERO)
                .build();

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").exists());
    }

    @Test
    void requestQuote_withMissingSide_shouldReturn400() throws Exception {
        String body = "{\"currencyPair\":\"EUR/USD\",\"amount\":10000}";

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.side").exists());
    }

    @Test
    void requestQuote_whenServiceThrowsIllegalArgumentException_shouldReturn400() throws Exception {
        QuoteRequest request = QuoteRequest.builder()
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .build();

        when(quoteService.requestQuote(any()))
                .thenThrow(new IllegalArgumentException("Invalid currency pair"));

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid currency pair"));
    }

    @Test
    void requestQuote_withSellSide_shouldReturn201() throws Exception {
        QuoteRequest request = QuoteRequest.builder()
                .currencyPair("GBP/USD")
                .side(Side.SELL)
                .amount(new BigDecimal("5000.00"))
                .build();

        QuoteResponse response = QuoteResponse.builder()
                .quoteId(UUID.randomUUID())
                .currencyPair("GBP/USD")
                .side(Side.SELL)
                .amount(new BigDecimal("5000.00"))
                .rate(new BigDecimal("1.265000"))
                .expiresAt(LocalDateTime.now().plusMinutes(2))
                .createdAt(LocalDateTime.now())
                .build();

        when(quoteService.requestQuote(any())).thenReturn(response);

        mockMvc.perform(post("/api/quotes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.side").value("SELL"))
                .andExpect(jsonPath("$.currencyPair").value("GBP/USD"));
    }
}
