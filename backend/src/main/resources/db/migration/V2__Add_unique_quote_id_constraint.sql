-- Prevent the same quote from being booked more than once
ALTER TABLE trades ADD CONSTRAINT unique_quote_id UNIQUE (quote_id);
