package com.demo.fxportal.repository;

import com.demo.fxportal.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TradeRepository extends JpaRepository<Trade, UUID>, JpaSpecificationExecutor<Trade> {
}
