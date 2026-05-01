CREATE TABLE tracking_code_sequences (
    sector_prefix VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    last_seq INT NOT NULL DEFAULT 0,
    PRIMARY KEY (sector_prefix, year)
);

CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    tracking_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    current_machine_id BIGINT REFERENCES machines(id) ON DELETE SET NULL,
    current_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    total_input_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
    total_output_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
    total_waste_qty NUMERIC(12,3) GENERATED ALWAYS AS (total_input_qty - total_output_qty) STORED,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_material_type CHECK (material_type IN ('RAW_MATERIAL', 'SEMI_PRODUCT', 'FINISHED_PRODUCT'))
);

CREATE TABLE shifts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    supervisor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE production_records (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES materials(id),
    machine_id BIGINT NOT NULL REFERENCES machines(id),
    department_id BIGINT NOT NULL REFERENCES departments(id),
    shift_id BIGINT REFERENCES shifts(id),
    recorded_by BIGINT NOT NULL REFERENCES users(id),
    input_qty NUMERIC(12,3) NOT NULL,
    output_qty NUMERIC(12,3) NOT NULL,
    waste_qty NUMERIC(12,3) GENERATED ALWAYS AS (input_qty - output_qty) STORED,
    waste_rate NUMERIC(6,3) GENERATED ALWAYS AS (
        CASE
            WHEN input_qty = 0 THEN 0
            ELSE ((input_qty - output_qty) / input_qty) * 100
        END
    ) STORED,
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE material_stage_history (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES materials(id),
    machine_id BIGINT REFERENCES machines(id),
    department_id BIGINT REFERENCES departments(id),
    entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ,
    production_record_id BIGINT REFERENCES production_records(id)
);

