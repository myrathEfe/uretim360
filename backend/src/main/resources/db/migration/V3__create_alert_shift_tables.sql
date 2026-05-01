CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    machine_id BIGINT REFERENCES machines(id),
    material_id BIGINT REFERENCES materials(id),
    message TEXT NOT NULL,
    threshold_value NUMERIC(10,3),
    actual_value NUMERIC(10,3),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_alert_type CHECK (alert_type IN ('HIGH_WASTE_RATE', 'LONG_FAULT_DURATION', 'LONG_STOP_DURATION')),
    CONSTRAINT chk_alert_severity CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
);

CREATE INDEX idx_machine_status_logs_machine_open ON machine_status_logs (machine_id, ended_at);
CREATE INDEX idx_production_records_machine_recorded_at ON production_records (machine_id, recorded_at DESC);
CREATE INDEX idx_alerts_is_read_created_at ON alerts (is_read, created_at DESC);

