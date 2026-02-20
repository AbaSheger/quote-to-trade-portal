package com.demo.fxportal.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @RestController
    static class TestController {

        @GetMapping("/test/bad-argument")
        public void throwIllegalArgument() {
            throw new IllegalArgumentException("Quote not found: abc-123");
        }

        @GetMapping("/test/conflict")
        public void throwIllegalState() {
            throw new IllegalStateException("Quote has expired");
        }

        @GetMapping("/test/server-error")
        public void throwGenericException() {
            throw new RuntimeException("Unexpected database error");
        }
    }

    @Test
    void handleIllegalArgumentException_shouldReturn400WithMessage() throws Exception {
        mockMvc.perform(get("/test/bad-argument"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Quote not found: abc-123"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void handleIllegalStateException_shouldReturn409WithMessage() throws Exception {
        mockMvc.perform(get("/test/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Quote has expired"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void handleGenericException_shouldReturn500WithGenericMessage() throws Exception {
        mockMvc.perform(get("/test/server-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void handleGenericException_shouldNotLeakInternalDetails() throws Exception {
        mockMvc.perform(get("/test/server-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"));
        // Ensures the actual exception message ("Unexpected database error") is not exposed
    }
}
