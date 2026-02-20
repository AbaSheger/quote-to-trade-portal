package com.demo.fxportal.service;

import com.demo.fxportal.dto.TradeRequest;
import com.demo.fxportal.dto.TradeResponse;
import com.demo.fxportal.model.Quote;
import com.demo.fxportal.model.Side;
import com.demo.fxportal.model.Trade;
import com.demo.fxportal.repository.QuoteRepository;
import com.demo.fxportal.repository.TradeRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeService {

    private final TradeRepository tradeRepository;
    private final QuoteRepository quoteRepository;

    @Transactional
    public TradeResponse bookTrade(TradeRequest request) {
        log.info("Booking trade for quote ID: {}", request.getQuoteId());

        Quote quote = quoteRepository.findById(request.getQuoteId())
                .orElseThrow(() -> new IllegalArgumentException("Quote not found: " + request.getQuoteId()));

        if (quote.isExpired()) {
            throw new IllegalStateException("Quote has expired");
        }

        if (tradeRepository.existsByQuoteId(request.getQuoteId())) {
            throw new IllegalStateException("A trade has already been booked for this quote");
        }

        Trade trade = Trade.builder()
                .quoteId(quote.getId())
                .currencyPair(quote.getCurrencyPair())
                .side(quote.getSide())
                .amount(quote.getAmount())
                .rate(quote.getRate())
                .status(Trade.Status.BOOKED)
                .build();

        trade = tradeRepository.save(trade);
        log.info("Trade booked with ID: {}", trade.getId());

        return TradeResponse.fromEntity(trade);
    }

    @Transactional(readOnly = true)
    public Page<TradeResponse> getTradeHistory(
            Optional<String> currencyPair,
            Optional<Side> side,
            Optional<Trade.Status> status,
            Optional<LocalDateTime> fromDate,
            Optional<LocalDateTime> toDate,
            Pageable pageable) {

        Specification<Trade> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            currencyPair.ifPresent(cp ->
                    predicates.add(criteriaBuilder.equal(root.get("currencyPair"), cp)));

            side.ifPresent(s ->
                    predicates.add(criteriaBuilder.equal(root.get("side"), s)));

            status.ifPresent(st ->
                    predicates.add(criteriaBuilder.equal(root.get("status"), st)));

            fromDate.ifPresent(fd ->
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("bookedAt"), fd)));

            toDate.ifPresent(td ->
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("bookedAt"), td)));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return tradeRepository.findAll(spec, pageable)
                .map(TradeResponse::fromEntity);
    }
}
