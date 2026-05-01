INSERT INTO departments (id, name, sector_type, display_order, is_active, created_at)
VALUES
    (1, 'Raw Material Processing', 'TEXTILE', 1, TRUE, now()),
    (2, 'Yarn Production', 'TEXTILE', 2, TRUE, now()),
    (3, 'Dyeing', 'TEXTILE', 3, TRUE, now()),
    (4, 'Cutting', 'TEXTILE', 4, TRUE, now()),
    (5, 'Packaging & Logistics', 'TEXTILE', 5, TRUE, now());

INSERT INTO tracking_code_sequences (sector_prefix, year, last_seq)
VALUES ('TXT', 2026, 3)
ON CONFLICT (sector_prefix, year) DO NOTHING;

INSERT INTO users (id, email, password_hash, full_name, role, department_id, is_active, created_at, updated_at)
VALUES
    (1, 'admin@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Sistem Yöneticisi', 'ADMIN', NULL, TRUE, now(), now()),
    (2, 'manager@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Fabrika Müdürü', 'FACTORY_MANAGER', NULL, TRUE, now(), now()),
    (3, 'supervisor1@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Vardiya Şefi 1', 'SHIFT_SUPERVISOR', 1, TRUE, now(), now()),
    (4, 'supervisor2@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Vardiya Şefi 2', 'SHIFT_SUPERVISOR', 3, TRUE, now(), now()),
    (5, 'operator1@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Operatör 1', 'OPERATOR', NULL, TRUE, now(), now()),
    (6, 'operator2@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Operatör 2', 'OPERATOR', NULL, TRUE, now(), now()),
    (7, 'operator3@meslite.com', '$2y$10$ksCApELoIfhl/2pl9IMXieKwqDjcJJS5WhW/dP017WsnAHCHzqJRC', 'Operatör 3', 'OPERATOR', NULL, TRUE, now(), now());

INSERT INTO machines (id, department_id, name, serial_number, status, status_since, is_active, created_at, updated_at)
VALUES
    (1, 1, 'Raw Feeder 01', 'TXT-RM-001', 'RUNNING', now() - interval '90 minutes', TRUE, now(), now()),
    (2, 1, 'Raw Feeder 02', 'TXT-RM-002', 'STOPPED', now() - interval '45 minutes', TRUE, now(), now()),
    (3, 2, 'Spinner 01', 'TXT-YR-001', 'RUNNING', now() - interval '3 hours', TRUE, now(), now()),
    (4, 2, 'Spinner 02', 'TXT-YR-002', 'MAINTENANCE', now() - interval '2 hours', TRUE, now(), now()),
    (5, 3, 'Dye Bath 01', 'TXT-DY-001', 'FAULT', now() - interval '20 minutes', TRUE, now(), now()),
    (6, 3, 'Dye Bath 02', 'TXT-DY-002', 'RUNNING', now() - interval '1 hour', TRUE, now(), now()),
    (7, 4, 'Cutter 01', 'TXT-CT-001', 'RUNNING', now() - interval '80 minutes', TRUE, now(), now()),
    (8, 4, 'Cutter 02', 'TXT-CT-002', 'STOPPED', now() - interval '15 minutes', TRUE, now(), now()),
    (9, 5, 'Pack Line 01', 'TXT-PK-001', 'RUNNING', now() - interval '4 hours', TRUE, now(), now()),
    (10, 5, 'Pack Line 02', 'TXT-PK-002', 'STOPPED', now() - interval '50 minutes', TRUE, now(), now());

INSERT INTO operator_machines (user_id, machine_id)
VALUES
    (5, 1),
    (5, 2),
    (6, 5),
    (6, 6),
    (7, 9),
    (7, 10);

INSERT INTO shifts (id, name, supervisor_id, start_time, end_time, is_active, created_at)
VALUES
    (1, 'Sabah Vardiyası', 3, now() - interval '4 hours', NULL, TRUE, now()),
    (2, 'Akşam Vardiyası', 4, now() - interval '12 hours', now() - interval '4 hours', FALSE, now());

INSERT INTO materials (id, tracking_code, name, material_type, current_machine_id, current_department_id, total_input_qty, total_output_qty, is_completed, created_at, updated_at)
VALUES
    (1, 'TXT-2026-00001', 'Pamuk Elyaf Lot A', 'RAW_MATERIAL', 1, 1, 12.500, 11.400, FALSE, now() - interval '2 days', now()),
    (2, 'TXT-2026-00002', 'İplik Bobin Parti B', 'SEMI_PRODUCT', 5, 3, 8.000, 6.800, FALSE, now() - interval '1 day', now()),
    (3, 'TXT-2026-00003', 'Hazır Kumaş Seri C', 'FINISHED_PRODUCT', 9, 5, 5.400, 5.050, FALSE, now() - interval '10 hours', now());

INSERT INTO production_records (id, material_id, machine_id, department_id, shift_id, recorded_by, input_qty, output_qty, notes, recorded_at)
VALUES
    (1, 1, 1, 1, 1, 3, 4.500, 4.250, 'İlk ayıklama tamamlandı.', now() - interval '6 hours'),
    (2, 1, 3, 2, 1, 3, 3.200, 3.000, 'İplik çekimi dengeli.', now() - interval '5 hours'),
    (3, 2, 5, 3, 1, 4, 2.400, 1.900, 'Renk tutarsızlığı nedeniyle fire oluştu.', now() - interval '3 hours'),
    (4, 2, 6, 3, 1, 6, 1.800, 1.650, 'Boya kazanı ikinci çevrim.', now() - interval '2 hours'),
    (5, 3, 9, 5, 1, 7, 1.200, 1.150, 'Paketleme hattı stabil.', now() - interval '1 hour');

INSERT INTO material_stage_history (material_id, machine_id, department_id, entered_at, left_at, production_record_id)
VALUES
    (1, 1, 1, now() - interval '6 hours', now() - interval '5 hours 10 minutes', 1),
    (1, 3, 2, now() - interval '5 hours', NULL, 2),
    (2, 5, 3, now() - interval '3 hours', now() - interval '2 hours 15 minutes', 3),
    (2, 6, 3, now() - interval '2 hours', NULL, 4),
    (3, 9, 5, now() - interval '1 hour', NULL, 5);

INSERT INTO machine_status_logs (machine_id, old_status, new_status, changed_by, note, started_at, ended_at)
VALUES
    (1, 'STOPPED', 'RUNNING', 3, 'Hat açılışı yapıldı.', now() - interval '90 minutes', NULL),
    (2, 'RUNNING', 'STOPPED', 5, 'Hammadde bekleniyor.', now() - interval '45 minutes', NULL),
    (5, 'RUNNING', 'FAULT', 4, 'Boya pompası arızası.', now() - interval '20 minutes', NULL),
    (10, 'RUNNING', 'STOPPED', 7, 'Lojistik beklemesi.', now() - interval '50 minutes', NULL);

INSERT INTO alerts (alert_type, severity, machine_id, material_id, message, threshold_value, actual_value, is_read, created_at)
VALUES
    ('HIGH_WASTE_RATE', 'CRITICAL', 5, 2, 'Dye Bath 01 için fire oranı kritik seviyeyi aştı.', 20.000, 20.833, FALSE, now() - interval '3 hours'),
    ('LONG_FAULT_DURATION', 'CRITICAL', 5, NULL, 'Dye Bath 01 10 dakikadan uzun süredir arıza durumunda.', 10.000, 20.000, FALSE, now() - interval '10 minutes'),
    ('LONG_STOP_DURATION', 'WARNING', 10, NULL, 'Pack Line 02 aktif vardiyada 30 dakikadan uzun süredir duruyor.', 30.000, 50.000, FALSE, now() - interval '5 minutes');

SELECT setval('departments_id_seq', 5, TRUE);
SELECT setval('users_id_seq', 7, TRUE);
SELECT setval('machines_id_seq', 10, TRUE);
SELECT setval('materials_id_seq', 3, TRUE);
SELECT setval('production_records_id_seq', 5, TRUE);
SELECT setval('shifts_id_seq', 2, TRUE);
