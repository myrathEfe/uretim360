CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector_type VARCHAR(50) NOT NULL DEFAULT 'TEXTILE',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_departments_sector_type CHECK (sector_type IN ('TEXTILE', 'FOOD', 'METAL', 'PLASTIC'))
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'FACTORY_MANAGER', 'SHIFT_SUPERVISOR', 'OPERATOR'))
);

CREATE TABLE machines (
    id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'STOPPED',
    status_since TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_machines_status CHECK (status IN ('RUNNING', 'STOPPED', 'MAINTENANCE', 'FAULT'))
);

CREATE TABLE machine_status_logs (
    id BIGSERIAL PRIMARY KEY,
    machine_id BIGINT NOT NULL REFERENCES machines(id),
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT NOT NULL REFERENCES users(id),
    note TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE operator_machines (
    user_id BIGINT NOT NULL REFERENCES users(id),
    machine_id BIGINT NOT NULL REFERENCES machines(id),
    PRIMARY KEY (user_id, machine_id)
);

