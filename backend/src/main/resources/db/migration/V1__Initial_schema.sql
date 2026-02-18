-- Create quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_pair VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    amount DECIMAL(19, 4) NOT NULL,
    rate DECIMAL(19, 6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT rate_positive CHECK (rate > 0)
);

-- Create trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL,
    currency_pair VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    amount DECIMAL(19, 4) NOT NULL,
    rate DECIMAL(19, 6) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_quotes_expires_at ON quotes(expires_at);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_trades_quote_id ON trades(quote_id);
CREATE INDEX idx_trades_booked_at ON trades(booked_at);
CREATE INDEX idx_trades_currency_pair ON trades(currency_pair);
CREATE INDEX idx_trades_status ON trades(status);
