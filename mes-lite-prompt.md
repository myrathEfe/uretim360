# MES-Lite Production Monitoring System — Technical Project Prompt

## ROLE

You are a senior full-stack software architect. Your task is to design and implement a
production-ready, well-structured web application from scratch based on the exact
specifications below. Do not add unrequested features. Do not skip steps. Do not produce
placeholder or stub code — every file must be runnable. Follow the output steps in order.

---

## PROJECT OVERVIEW

**Name:** MES-Lite Production Monitoring System  
**Purpose:** A modular, lightweight MES (Manufacturing Execution System) for Turkish SME
factories. The initial sector is textile. The architecture must support adding new sectors
(food, metal, plastic) later by extending core domain models without modifying them.  
**Deployment:** Docker Compose — PostgreSQL + Spring Boot backend + Next.js frontend all
start with a single `docker compose up`.  
**Development machine:** MacBook M2 (ARM64). All Docker images must be ARM-compatible.

---

## TECH STACK

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (component library)
- Recharts (charts)
- TanStack Table v8 (data tables)
- NextAuth.js v5 (session management — Credentials provider only, no OAuth)
- Axios (HTTP client)
- UI language: Turkish
- Code language (variables, functions, files, API paths): English

### Backend
- Java 21
- Spring Boot 3.x
- Spring Security + JJWT (stateless JWT, HS256)
- Spring Data JPA + Hibernate
- PostgreSQL 15
- Lombok
- MapStruct (DTO mapping)
- Bean Validation (jakarta.validation)
- Architecture: Controller → Service → Repository, strict layer separation
- Every endpoint returns a unified response envelope (see below)

### Infrastructure
- Docker Compose v3.8
- PostgreSQL runs in Docker
- Backend runs in Docker
- Frontend runs in Docker
- A single `.env` file at project root supplies all secrets

---

## AUTHENTICATION ARCHITECTURE

NextAuth.js manages the frontend session exclusively.  
Flow:
1. User submits email + password on the login page.
2. NextAuth `CredentialsProvider.authorize()` calls `POST /api/auth/login` on the Spring
   Boot backend.
3. Spring Boot validates credentials, returns `{ token, userId, role, name }`.
4. NextAuth stores the JWT and role inside the session object (JWT session strategy).
5. Every subsequent API call from the frontend sends `Authorization: Bearer <token>`.
6. Spring Security `JwtAuthenticationFilter` validates the token on every request.
7. Spring Security `@PreAuthorize` annotations enforce role-based access per endpoint.

Session strategy: JWT (no database sessions on the frontend side).  
Token expiry: 8 hours.  
Token fields: `sub` (userId), `role`, `email`, `iat`, `exp`.

---

## USER ROLES & PERMISSIONS

| Role             | Scope                                                                 |
|------------------|-----------------------------------------------------------------------|
| ADMIN            | Full system access. Creates users, assigns roles, manages factory structure. |
| FACTORY_MANAGER  | Read access to all departments and machines. Views all reports and dashboard. Cannot create users. |
| SHIFT_SUPERVISOR | Read/write access limited to their assigned department. Enters production records, updates machine status. |
| OPERATOR         | Read/write access limited to their assigned machines. Enters production input/output, triggers fault events. |

Role is stored as a single enum field per user (one role per user, no multi-role).  
`SHIFT_SUPERVISOR` has a FK to one `Department`.  
`OPERATOR` has a join table to one or more `Machine` records.

---

## DATABASE SCHEMA

Use PostgreSQL. All tables use `BIGSERIAL` primary keys except where UUID is specified.
All timestamps are `TIMESTAMP WITH TIME ZONE`, stored as UTC.
Enum types are stored as `VARCHAR(50)` with a check constraint.

---

### Table: `users`
```
id              BIGSERIAL PRIMARY KEY
email           VARCHAR(255) NOT NULL UNIQUE
password_hash   VARCHAR(255) NOT NULL
full_name       VARCHAR(255) NOT NULL
role            VARCHAR(50)  NOT NULL  CHECK (role IN ('ADMIN','FACTORY_MANAGER','SHIFT_SUPERVISOR','OPERATOR'))
department_id   BIGINT       REFERENCES departments(id) ON DELETE SET NULL   -- only for SHIFT_SUPERVISOR
is_active       BOOLEAN      NOT NULL DEFAULT TRUE
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

---

### Table: `departments`
```
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
sector_type     VARCHAR(50)  NOT NULL DEFAULT 'TEXTILE'  CHECK (sector_type IN ('TEXTILE','FOOD','METAL','PLASTIC'))
display_order   INT          NOT NULL DEFAULT 0
is_active       BOOLEAN      NOT NULL DEFAULT TRUE
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

Seed rows (sector_type = 'TEXTILE'):
1. Raw Material Processing
2. Yarn Production
3. Dyeing
4. Cutting
5. Packaging & Logistics

---

### Table: `machines`
```
id              BIGSERIAL PRIMARY KEY
department_id   BIGINT       NOT NULL REFERENCES departments(id)
name            VARCHAR(255) NOT NULL
serial_number   VARCHAR(100)
status          VARCHAR(50)  NOT NULL DEFAULT 'STOPPED'
                CHECK (status IN ('RUNNING','STOPPED','MAINTENANCE','FAULT'))
status_since    TIMESTAMPTZ  NOT NULL DEFAULT now()   -- timestamp of last status change
is_active       BOOLEAN      NOT NULL DEFAULT TRUE
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

---

### Table: `machine_status_logs`
Records every status transition for audit and duration calculation.
```
id              BIGSERIAL PRIMARY KEY
machine_id      BIGINT       NOT NULL REFERENCES machines(id)
old_status      VARCHAR(50)
new_status      VARCHAR(50)  NOT NULL
changed_by      BIGINT       NOT NULL REFERENCES users(id)
note            TEXT
started_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
ended_at        TIMESTAMPTZ                           -- NULL means currently active
```

Rule: When a new status log row is inserted for a machine, the previous open row's
`ended_at` is set to `now()` in the same transaction.  
Fault duration = `ended_at - started_at` WHERE `new_status = 'FAULT'`.

---

### Table: `operator_machines`
Join table — OPERATOR to Machine assignment.
```
user_id         BIGINT NOT NULL REFERENCES users(id)
machine_id      BIGINT NOT NULL REFERENCES machines(id)
PRIMARY KEY (user_id, machine_id)
```

---

### Table: `materials`
Tracks every physical lot entering the factory.
```
id              BIGSERIAL PRIMARY KEY
tracking_code   VARCHAR(50)  NOT NULL UNIQUE   -- system-generated: TXT-2025-00001
name            VARCHAR(255) NOT NULL
material_type   VARCHAR(50)  NOT NULL
                CHECK (material_type IN ('RAW_MATERIAL','SEMI_PRODUCT','FINISHED_PRODUCT'))
current_machine_id   BIGINT  REFERENCES machines(id) ON DELETE SET NULL
current_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL
total_input_qty  NUMERIC(12,3) NOT NULL DEFAULT 0   -- tonnes
total_output_qty NUMERIC(12,3) NOT NULL DEFAULT 0
total_waste_qty  NUMERIC(12,3) GENERATED ALWAYS AS (total_input_qty - total_output_qty) STORED
is_completed    BOOLEAN      NOT NULL DEFAULT FALSE
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

`tracking_code` generation rule: `{SECTOR_PREFIX}-{YYYY}-{5-digit sequence}`.  
Sequence resets per year per sector. Backend handles this in a DB sequence or application
counter — use a dedicated sequence table (see below).

---

### Table: `tracking_code_sequences`
```
sector_prefix   VARCHAR(10)  NOT NULL
year            INT          NOT NULL
last_seq        INT          NOT NULL DEFAULT 0
PRIMARY KEY (sector_prefix, year)
```

---

### Table: `production_records`
One row = one production entry submitted by a user for a specific machine and material.
```
id              BIGSERIAL PRIMARY KEY
material_id     BIGINT       NOT NULL REFERENCES materials(id)
machine_id      BIGINT       NOT NULL REFERENCES machines(id)
department_id   BIGINT       NOT NULL REFERENCES departments(id)
shift_id        BIGINT       REFERENCES shifts(id)
recorded_by     BIGINT       NOT NULL REFERENCES users(id)
input_qty       NUMERIC(12,3) NOT NULL        -- tonnes
output_qty      NUMERIC(12,3) NOT NULL        -- tonnes
waste_qty       NUMERIC(12,3) GENERATED ALWAYS AS (input_qty - output_qty) STORED
waste_rate      NUMERIC(6,3)  GENERATED ALWAYS AS (
                  CASE WHEN input_qty = 0 THEN 0
                       ELSE ((input_qty - output_qty) / input_qty) * 100
                  END
                ) STORED                       -- percentage
notes           TEXT
recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
```

---

### Table: `material_stage_history`
Immutable log — every time a material moves to a new machine/department.
```
id              BIGSERIAL PRIMARY KEY
material_id     BIGINT       NOT NULL REFERENCES materials(id)
machine_id      BIGINT       REFERENCES machines(id)
department_id   BIGINT       REFERENCES departments(id)
entered_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
left_at         TIMESTAMPTZ
production_record_id BIGINT  REFERENCES production_records(id)
```

---

### Table: `shifts`
```
id              BIGSERIAL PRIMARY KEY
name            VARCHAR(100) NOT NULL          -- e.g. "Sabah Vardiyası"
supervisor_id   BIGINT       REFERENCES users(id) ON DELETE SET NULL
start_time      TIMESTAMPTZ  NOT NULL
end_time        TIMESTAMPTZ
is_active       BOOLEAN      NOT NULL DEFAULT TRUE
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

---

### Table: `alerts`
```
id              BIGSERIAL PRIMARY KEY
alert_type      VARCHAR(50)  NOT NULL
                CHECK (alert_type IN ('HIGH_WASTE_RATE','LONG_FAULT_DURATION','LONG_STOP_DURATION'))
severity        VARCHAR(20)  NOT NULL DEFAULT 'WARNING'
                CHECK (severity IN ('INFO','WARNING','CRITICAL'))
machine_id      BIGINT       REFERENCES machines(id)
material_id     BIGINT       REFERENCES materials(id)
message         TEXT         NOT NULL
threshold_value NUMERIC(10,3)
actual_value    NUMERIC(10,3)
is_read         BOOLEAN      NOT NULL DEFAULT FALSE
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

Alert trigger rules (evaluated server-side after each production record save and after each
machine status change):
- `HIGH_WASTE_RATE`: waste_rate > 10% on any single production record → severity WARNING;
  waste_rate > 20% → severity CRITICAL.
- `LONG_FAULT_DURATION`: machine has been in FAULT status for > 10 minutes.
- `LONG_STOP_DURATION`: machine has been in STOPPED status for > 30 minutes during an
  active shift.

---

## BACKEND — UNIFIED RESPONSE ENVELOPE

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```
On error:
```json
{
  "success": false,
  "data": null,
  "message": "Hata açıklaması",
  "timestamp": "2025-01-15T10:30:00Z"
}
```
HTTP status codes are still meaningful (400, 401, 403, 404, 409, 500).

---

## BACKEND — ENDPOINT LIST

### Auth
```
POST   /api/auth/login          Public. Body: { email, password }. Returns JWT + user info.
POST   /api/auth/refresh        Authenticated. Returns new token.
GET    /api/auth/me             Authenticated. Returns current user profile.
```

### Users (ADMIN only unless noted)
```
GET    /api/users               ADMIN
POST   /api/users               ADMIN. Creates user.
GET    /api/users/{id}          ADMIN
PUT    /api/users/{id}          ADMIN
DELETE /api/users/{id}          ADMIN. Soft delete (is_active = false).
GET    /api/users/{id}/machines ADMIN, FACTORY_MANAGER. Returns assigned machines for OPERATOR.
POST   /api/users/{id}/machines ADMIN. Assigns machines to OPERATOR.
```

### Departments
```
GET    /api/departments                    ADMIN, FACTORY_MANAGER, SHIFT_SUPERVISOR
POST   /api/departments                    ADMIN
PUT    /api/departments/{id}               ADMIN
DELETE /api/departments/{id}               ADMIN
GET    /api/departments/{id}/machines      All authenticated roles (filtered by assignment for SUPERVISOR/OPERATOR)
```

### Machines
```
GET    /api/machines                       ADMIN, FACTORY_MANAGER
GET    /api/machines/{id}                  All roles (access check enforced)
POST   /api/machines                       ADMIN
PUT    /api/machines/{id}                  ADMIN
DELETE /api/machines/{id}                  ADMIN
PATCH  /api/machines/{id}/status           SHIFT_SUPERVISOR, OPERATOR (assigned machines only).
                                           Body: { newStatus, note }
                                           Automatically creates machine_status_log row.
GET    /api/machines/{id}/status-logs      ADMIN, FACTORY_MANAGER, SHIFT_SUPERVISOR
```

### Materials
```
GET    /api/materials                      ADMIN, FACTORY_MANAGER
GET    /api/materials/{id}                 All roles
GET    /api/materials/tracking/{code}      All roles. Look up by tracking code.
POST   /api/materials                      ADMIN, SHIFT_SUPERVISOR
PUT    /api/materials/{id}                 ADMIN, SHIFT_SUPERVISOR
GET    /api/materials/{id}/history         All roles. Returns stage history.
```

### Production Records
```
GET    /api/production-records             ADMIN, FACTORY_MANAGER (all); SHIFT_SUPERVISOR (own dept); OPERATOR (own machines)
POST   /api/production-records             SHIFT_SUPERVISOR, OPERATOR
                                           Triggers: material position update, stage history insert, alert evaluation.
GET    /api/production-records/{id}        Same scope as GET list.
DELETE /api/production-records/{id}        ADMIN only.
```

### Shifts
```
GET    /api/shifts                         All roles
POST   /api/shifts                         ADMIN, SHIFT_SUPERVISOR
PUT    /api/shifts/{id}                    ADMIN, SHIFT_SUPERVISOR (own shifts only)
PATCH  /api/shifts/{id}/end                SHIFT_SUPERVISOR (own), ADMIN
```

### Alerts
```
GET    /api/alerts                         ADMIN, FACTORY_MANAGER (all); SHIFT_SUPERVISOR (own dept)
PATCH  /api/alerts/{id}/read               All authenticated roles
GET    /api/alerts/unread-count            All authenticated roles
```

### Dashboard
```
GET    /api/dashboard/summary              ADMIN, FACTORY_MANAGER
       Returns: total production, total waste, avg waste rate, machine status counts,
                top waste machines (top 5), department breakdown.
GET    /api/dashboard/machine-status       All roles (filtered by scope)
GET    /api/dashboard/production-trend     ADMIN, FACTORY_MANAGER. Query params: ?days=7|30
GET    /api/dashboard/department-stats     ADMIN, FACTORY_MANAGER
```

---

## BACKEND — FOLDER STRUCTURE

```
backend/
├── src/main/java/com/meslite/
│   ├── MesLiteApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   └── CorsConfig.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── UserDetailsServiceImpl.java
│   ├── common/
│   │   ├── ApiResponse.java           (generic response envelope)
│   │   ├── GlobalExceptionHandler.java
│   │   └── BaseEntity.java
│   ├── domain/
│   │   ├── user/
│   │   │   ├── User.java
│   │   │   ├── Role.java (enum)
│   │   │   ├── UserRepository.java
│   │   │   ├── UserService.java
│   │   │   ├── UserController.java
│   │   │   └── dto/
│   │   │       ├── UserCreateRequest.java
│   │   │       ├── UserUpdateRequest.java
│   │   │       └── UserResponse.java
│   │   ├── department/
│   │   ├── machine/
│   │   ├── material/
│   │   ├── production/
│   │   ├── shift/
│   │   ├── alert/
│   │   └── dashboard/
│   └── auth/
│       ├── AuthController.java
│       ├── AuthService.java
│       └── dto/
│           ├── LoginRequest.java
│           └── LoginResponse.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-docker.yml
│   └── db/migration/                  (Flyway migrations)
│       ├── V1__create_core_tables.sql
│       ├── V2__create_material_tables.sql
│       ├── V3__create_alert_shift_tables.sql
│       └── V4__seed_data.sql
└── Dockerfile
```

---

## FRONTEND — FOLDER STRUCTURE

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      (redirect to /dashboard or /login)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                (sidebar + topbar, protected)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── makineler/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── bolumler/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── malzemeler/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── uretim-kayitlari/
│   │   │   └── page.tsx
│   │   ├── vardiyalar/
│   │   │   └── page.tsx
│   │   ├── uyarilar/
│   │   │   └── page.tsx
│   │   └── kullanicilar/             (ADMIN only)
│   │       └── page.tsx
├── components/
│   ├── ui/                           (shadcn/ui components)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── ProductionTrendChart.tsx
│   │   ├── MachineStatusChart.tsx
│   │   ├── DepartmentStatsChart.tsx
│   │   └── AlertBanner.tsx
│   ├── machines/
│   ├── materials/
│   └── common/
│       ├── DataTable.tsx             (TanStack Table wrapper)
│       ├── PageHeader.tsx
│       └── RoleBadge.tsx
├── lib/
│   ├── axios.ts                      (Axios instance, attaches Bearer token from session)
│   ├── auth.ts                       (NextAuth config)
│   └── utils.ts
├── types/
│   ├── user.ts
│   ├── machine.ts
│   ├── material.ts
│   ├── production.ts
│   └── alert.ts
├── hooks/
│   ├── useDashboard.ts
│   ├── useMachines.ts
│   └── useMaterials.ts
├── middleware.ts                     (NextAuth route protection)
└── Dockerfile
```

---

## FRONTEND — DASHBOARD PAGE SPECIFICATION

The dashboard page must contain the following sections in this layout order:

**Row 1 — Summary Cards (4 cards):**
- Toplam Üretim (tonnes, current shift or today)
- Toplam Fire (tonnes)
- Ortalama Fire Oranı (%)
- Arızalı Makine Sayısı (count, with red badge if > 0)

**Row 2 — Alerts Banner:**
- If any unread alerts exist: show a dismissible warning bar listing the top 3 most recent
  alerts with severity color coding (yellow = WARNING, red = CRITICAL).

**Row 3 — Charts (2 columns):**
- Left: Recharts `AreaChart` — production vs waste over last 7 days (daily totals).
- Right: Recharts `PieChart` — machine status distribution (RUNNING / STOPPED /
  MAINTENANCE / FAULT) with count labels.

**Row 4 — Tables (2 columns):**
- Left: Department stats table (department name, total production, total waste, waste rate %).
- Right: Top 5 waste machines table (machine name, department, waste rate %, trend arrow).

**Row 5 — Machine Status Grid:**
- A card grid showing every machine with a color-coded status pill, current material
  tracking code (if any), and time in current status.

---

## MACHINE STATUS UPDATE FLOW

When SHIFT_SUPERVISOR or OPERATOR clicks "Arıza Başladı" (or any status change button):
1. Frontend sends `PATCH /api/machines/{id}/status` with `{ newStatus: "FAULT", note: "..." }`.
2. Backend:
   a. Updates `machines.status` and `machines.status_since = now()`.
   b. Closes the previous open `machine_status_logs` row (`ended_at = now()`).
   c. Inserts a new `machine_status_logs` row (`started_at = now()`, `ended_at = NULL`).
   d. Schedules (or marks for next poll) fault duration check for alert evaluation.
3. Alert evaluation runs synchronously after status change:
   - If `new_status = 'FAULT'` and duration > 10 min: insert `alerts` row
     (type = LONG_FAULT_DURATION).

Alert evaluation for production records runs synchronously after `POST /api/production-records`.

---

## MATERIAL TRACKING CODE GENERATION

Backend logic (in `MaterialService.generateTrackingCode()`):
```
1. Determine sector prefix from department.sector_type → e.g. "TXT"
2. Get current year → e.g. 2025
3. Execute: UPDATE tracking_code_sequences SET last_seq = last_seq + 1
            WHERE sector_prefix = 'TXT' AND year = 2025
            RETURNING last_seq
   (If row does not exist, INSERT first.)
4. Format: TXT-2025-00001 (zero-padded to 5 digits)
```
This must be done inside a database transaction to prevent race conditions.

---

## DOCKER COMPOSE SPECIFICATION

File: `docker-compose.yml` at project root.

Services:
- `postgres` — image: `postgres:15-alpine`, port 5432, volume for persistence, env vars
  from `.env`.
- `backend` — built from `./backend/Dockerfile`, port 8080, depends on `postgres`,
  `SPRING_PROFILES_ACTIVE=docker`.
- `frontend` — built from `./frontend/Dockerfile`, port 3000, depends on `backend`.

All three must start successfully with `docker compose up --build`.  
Backend must wait for PostgreSQL to be ready (use `depends_on` with `condition:
service_healthy` + a healthcheck on the postgres service).

`.env` file must contain:
```
POSTGRES_DB=meslite
POSTGRES_USER=meslite_user
POSTGRES_PASSWORD=meslite_pass
JWT_SECRET=<at_least_64_char_hex_string>
NEXTAUTH_SECRET=<random_string>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## SEED DATA (V4__seed_data.sql)

Insert the following records. Passwords are bcrypt-hashed in the SQL (provide the hash for
`password = "Test1234!"`).

**Users:**
| full_name           | email                       | role             |
|---------------------|-----------------------------|------------------|
| Sistem Yöneticisi   | admin@meslite.com           | ADMIN            |
| Fabrika Müdürü      | manager@meslite.com         | FACTORY_MANAGER  |
| Vardiya Şefi 1      | supervisor1@meslite.com     | SHIFT_SUPERVISOR |
| Vardiya Şefi 2      | supervisor2@meslite.com     | SHIFT_SUPERVISOR |
| Operatör 1          | operator1@meslite.com       | OPERATOR         |
| Operatör 2          | operator2@meslite.com       | OPERATOR         |
| Operatör 3          | operator3@meslite.com       | OPERATOR         |

**Departments:** 5 textile departments listed above (display_order 1–5).

**Machines:** At least 2 machines per department (10 total minimum). Mix statuses across
RUNNING, STOPPED, FAULT.

**Materials:** 3 seed materials (one per material_type: RAW_MATERIAL, SEMI_PRODUCT,
FINISHED_PRODUCT) with realistic tracking codes.

**Production Records:** At least 5 records across different machines and materials,
including at least one record with waste_rate > 10% to trigger an alert row.

**Alerts:** Matching alert rows for the above production records and one FAULT machine.

---

## README.md SPECIFICATION

The README must include:
1. Project purpose (2 paragraphs, Turkish)
2. Architecture diagram (ASCII)
3. Prerequisites (Docker Desktop, Node.js optional for local dev)
4. Quick start: `cp .env.example .env && docker compose up --build`
5. User roles table with example login credentials
6. Endpoint summary table
7. Module extension guide (how to add a new sector)

---

## OUTPUT STEPS — FOLLOW IN ORDER

Produce each section completely before moving to the next. Do not summarize or truncate
any file.

1. **Technical architecture description** — written explanation of all layers and their
   interactions.
2. **Entity relationship diagram** — ASCII or textual ERD showing all tables and FK
   relationships.
3. **Docker Compose file** (`docker-compose.yml` + `.env.example`)
4. **Flyway migration SQL files** (V1 through V4 — complete, runnable SQL)
5. **Spring Boot — complete backend code** for every domain package listed in the folder
   structure. Include: entity, repository, service, controller, DTOs, mapper. Start with
   `config/` and `security/` packages, then `auth/`, then each domain package in order.
6. **application.yml** and **application-docker.yml**
7. **Backend Dockerfile**
8. **Next.js — complete frontend code**: start with `lib/auth.ts` (NextAuth config),
   then `lib/axios.ts`, then `types/`, then `components/`, then `app/` pages in order.
9. **Frontend Dockerfile**
10. **README.md**

---

## QUALITY CONSTRAINTS

- No placeholder comments like `// TODO` or `// implement later`.
- No stub service methods that return `null` or empty responses.
- Every controller must have working `@PreAuthorize` annotations.
- Every DTO must have `@Valid` constraints where applicable.
- The frontend `middleware.ts` must redirect unauthenticated users to `/login` and
  redirect users to role-appropriate default pages after login.
- Role-based UI rendering: menu items, buttons, and forms must be conditionally rendered
  based on `session.user.role`. An OPERATOR must never see the user management page.
- Recharts components must render with realistic data from the seed dataset.
- No microservices. Single Spring Boot application. Single Next.js application.
- Do not use `any` type in TypeScript except where unavoidable, and comment why.
