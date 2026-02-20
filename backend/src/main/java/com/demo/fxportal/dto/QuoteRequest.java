package com.demo.fxportal.dto;

import com.demo.fxportal.model.Side;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteRequest {

    @NotBlank(message = "Currency pair is required")
    @Pattern(regexp = "^[A-Z]{3}/[A-Z]{3}$", message = "Currency pair must be in format XXX/YYY (e.g., EUR/USD)")
    private String currencyPair;

    @NotNull(message = "Side is required")
    private Side side;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0001", inclusive = true, message = "Amount must be greater than 0")
    @Digits(integer = 15, fraction = 4, message = "Amount must have at most 15 integer digits and 4 decimal places")
    private BigDecimal amount;
}
