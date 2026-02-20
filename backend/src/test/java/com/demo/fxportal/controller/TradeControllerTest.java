package com.demo.fxportal.controller;

import com.demo.fxportal.dto.TradeRequest;
import com.demo.fxportal.dto.TradeResponse;
import com.demo.fxportal.model.Side;
import com.demo.fxportal.model.Trade;
import com.demo.fxportal.service.TradeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TradeController.class)
class TradeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TradeService tradeService;

    private TradeResponse buildTradeResponse() {
        return TradeResponse.builder()
                .tradeId(UUID.randomUUID())
                .quoteId(UUID.randomUUID())
                .currencyPair("EUR/USD")
                .side(Side.BUY)
                .amount(new BigDecimal("10000.00"))
                .rate(new BigDecimal("1.085000"))
                .status(Trade.Status.BOOKED)
                .bookedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void bookTrade_withValidRequest_shouldReturn201() throws Exception {
        TradeRequest request = TradeRequest.builder()
                .quoteId(UUID.randomUUID())
                .build();

        when(tradeService.bookTrade(any())).thenReturn(buildTradeResponse());

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.currencyPair").value("EUR/USD"))
                .andExpect(jsonPath("$.status").value("BOOKED"))
                .andExpect(jsonPath("$.tradeId").exists())
                .andExpect(jsonPath("$.quoteId").exists());
    }

    @Test
    void bookTrade_withMissingQuoteId_shouldReturn400() throws Exception {
        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.quoteId").exists());
    }

    @Test
    void bookTrade_whenQuoteNotFound_shouldReturn400() throws Exception {
        TradeRequest request = TradeRequest.builder()
                .quoteId(UUID.randomUUID())
                .build();

        when(tradeService.bookTrade(any()))
                .thenThrow(new IllegalArgumentException("Quote not found: " + UUID.randomUUID()));

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Quote not found")));
    }

    @Test
    void bookTrade_whenQuoteExpired_shouldReturn409() throws Exception {
        TradeRequest request = TradeRequest.builder()
                .quoteId(UUID.randomUUID())
                .build();

        when(tradeService.bookTrade(any()))
                .thenThrow(new IllegalStateException("Quote has expired"));

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Quote has expired"));
    }

    @Test
    void bookTrade_whenAlreadyBooked_shouldReturn409() throws Exception {
        TradeRequest request = TradeRequest.builder()
                .quoteId(UUID.randomUUID())
                .build();

        when(tradeService.bookTrade(any()))
                .thenThrow(new IllegalStateException("A trade has already been booked for this quote"));

        mockMvc.perform(post("/api/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("A trade has already been booked for this quote"));
    }

    @Test
    void getTradeHistory_noFilters_shouldReturn200WithPage() throws Exception {
        Page<TradeResponse> page = new PageImpl<>(List.of(buildTradeResponse()));
        when(tradeService.getTradeHistory(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/trades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].currencyPair").value("EUR/USD"))
                .andExpect(jsonPath("$.content[0].status").value("BOOKED"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getTradeHistory_withFilters_shouldReturn200() throws Exception {
        Page<TradeResponse> page = new PageImpl<>(List.of(buildTradeResponse()));
        when(tradeService.getTradeHistory(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/trades")
                        .param("currencyPair", "EUR/USD")
                        .param("side", "BUY")
                        .param("status", "BOOKED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getTradeHistory_withEmptyResult_shouldReturn200EmptyPage() throws Exception {
        Page<TradeResponse> emptyPage = new PageImpl<>(List.of());
        when(tradeService.getTradeHistory(any(), any(), any(), any(), any(), any()))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/trades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void getTradeHistory_withPagination_shouldReturn200() throws Exception {
        Page<TradeResponse> page = new PageImpl<>(List.of(buildTradeResponse()));
        when(tradeService.getTradeHistory(any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        mockMvc.perform(get("/api/trades")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
