# MES-Lite Production Monitoring System

MES-Lite, tekstil odaklı üretim tesisleri için tasarlanmış hafif bir üretim izleme ve operasyon yönetim uygulamasıdır. Uygulama; makine durumlarını, vardiya akışını, üretim kayıtlarını, malzeme hareketlerini ve fire oranlarını tek panelde görünür hale getirerek sahadaki ekiplerin daha hızlı karar almasını hedefler. Türkçe arayüz sayesinde fabrika içi kullanım senaryolarına doğrudan uyum sağlar.

Mimari, yalnızca ilk tekstil senaryosunu değil; ileride gıda, metal ve plastik gibi sektörlerin de eklenebileceği şekilde modüler kurgulanmıştır. Sektör tipleri `Department` ve tracking code üretim mantığı üzerinden genişletilir; bu sayede çekirdek domain modeli korunurken yeni sektörler kontrollü biçimde sisteme dahil edilebilir.

## Teknik Mimari

- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS, NextAuth.js v5, Axios, Recharts, TanStack Table.
- Backend: Java 21, Spring Boot 3.x, Spring Security, JJWT, Spring Data JPA, Flyway, MapStruct, Bean Validation.
- Veritabanı: PostgreSQL 15.
- Dağıtım: Docker Compose ile `postgres + backend + frontend`.

### Katmanlar ve Etkileşim

1. Kullanıcı `frontend` üzerindeki giriş ekranından kimlik bilgilerini gönderir.
2. NextAuth `CredentialsProvider`, Spring Boot içindeki `POST /api/auth/login` endpoint’ini çağırır.
3. Backend JWT üretir ve kullanıcı rolünü döner.
4. NextAuth bu JWT’yi frontend oturumunda saklar.
5. Sonraki tüm frontend istekleri `Authorization: Bearer <token>` başlığıyla backend’e gider.
6. Spring Security `JwtAuthenticationFilter` ile token doğrular.
7. Controller katmanında `@PreAuthorize` ve servis katmanında scope kontrolleri uygulanır.
8. Tüm cevaplar ortak `ApiResponse<T>` zarfı ile döner.

### Mimari Diyagramı

```text
┌──────────────┐     Credentials Login      ┌────────────────────┐
│   Browser    │ ─────────────────────────▶ │ Next.js Frontend   │
│  (Turkish UI)│ ◀───────────────────────── │ NextAuth Session    │
└──────┬───────┘       Protected Pages       └─────────┬──────────┘
       │                                               │ Bearer JWT
       │ HTTP                                           ▼
       │                                      ┌────────────────────┐
       └────────────────────────────────────▶ │ Spring Boot API    │
                                              │ Controllers        │
                                              │ Services           │
                                              │ Repositories       │
                                              └─────────┬──────────┘
                                                        │ JPA/Flyway
                                                        ▼
                                              ┌────────────────────┐
                                              │ PostgreSQL 15      │
                                              │ Core MES Tables    │
                                              └────────────────────┘
```

## ERD

```text
departments (1) ────────< users.department_id
departments (1) ────────< machines.department_id
departments (1) ────────< materials.current_department_id
departments (1) ────────< production_records.department_id
departments (1) ────────< material_stage_history.department_id

users (1) ─────────────< machine_status_logs.changed_by
users (1) ─────────────< production_records.recorded_by
users (1) ─────────────< shifts.supervisor_id
users (M) >────────────< (M) machines  via operator_machines

machines (1) ──────────< machine_status_logs.machine_id
machines (1) ──────────< materials.current_machine_id
machines (1) ──────────< production_records.machine_id
machines (1) ──────────< material_stage_history.machine_id
machines (1) ──────────< alerts.machine_id

materials (1) ─────────< production_records.material_id
materials (1) ─────────< material_stage_history.material_id
materials (1) ─────────< alerts.material_id

shifts (1) ────────────< production_records.shift_id

tracking_code_sequences:
  PK = (sector_prefix, year)
  used by MaterialService.generateTrackingCode()
```

## Gereksinimler

- Docker Desktop
- Docker Compose
- Node.js 20+ yalnızca frontend’i Docker dışı geliştirmek isterseniz gerekli
- Java 21 yalnızca backend’i Docker dışı geliştirmek isterseniz gerekli

## Hızlı Başlangıç

```bash
cp .env.example .env
docker compose up --build
```

Servisler:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8080](http://localhost:8080)
- PostgreSQL: `localhost:5432`

## Roller ve Demo Giriş Bilgileri

| Rol | E-posta | Şifre | Kapsam |
|---|---|---|---|
| ADMIN | `admin@meslite.com` | `Test1234!` | Tüm sistem, kullanıcı ve yapı yönetimi |
| FACTORY_MANAGER | `manager@meslite.com` | `Test1234!` | Tüm görüntüleme ve raporlama |
| SHIFT_SUPERVISOR | `supervisor1@meslite.com` | `Test1234!` | Kendi bölümünde üretim ve makine aksiyonları |
| SHIFT_SUPERVISOR | `supervisor2@meslite.com` | `Test1234!` | Kendi bölümünde üretim ve makine aksiyonları |
| OPERATOR | `operator1@meslite.com` | `Test1234!` | Atanmış makinelerde üretim ve durum girişi |
| OPERATOR | `operator2@meslite.com` | `Test1234!` | Atanmış makinelerde üretim ve durum girişi |
| OPERATOR | `operator3@meslite.com` | `Test1234!` | Atanmış makinelerde üretim ve durum girişi |

## Endpoint Özeti

| Modül | Endpoint Grubu | Açıklama |
|---|---|---|
| Auth | `/api/auth/*` | Login, token refresh, aktif kullanıcı profili |
| Users | `/api/users/*` | ADMIN kullanıcı yönetimi ve operatör makine atama |
| Departments | `/api/departments/*` | Bölüm listeleme, CRUD, bölüme bağlı makineler |
| Machines | `/api/machines/*` | Makine CRUD, durum güncelleme, status log |
| Materials | `/api/materials/*` | Takip kodu üretimi, malzeme konumu, stage history |
| Production Records | `/api/production-records/*` | Üretim giriş/çıkış kayıtları ve fire hesapları |
| Shifts | `/api/shifts/*` | Vardiya başlatma, güncelleme, bitirme |
| Alerts | `/api/alerts/*` | Fire ve duruş/ariza uyarıları |
| Dashboard | `/api/dashboard/*` | Özet kartlar, trend, durum dağılımı, bölüm istatistikleri |

## Docker Yapısı

```text
root
├── docker-compose.yml
├── .env.example
├── backend
│   ├── Dockerfile
│   └── src/main/resources/db/migration
└── frontend
    └── Dockerfile
```

`docker compose up --build` çalıştığında:

- `postgres` healthcheck ile hazır hale gelir.
- `backend` Flyway migration’ları otomatik uygular.
- `frontend` NextAuth ile backend’e bağlanır.

## Modül Genişletme Rehberi

Yeni bir sektör eklemek için aşağıdaki akış izlenir:

1. `backend/src/main/java/com/meslite/domain/department/SectorType.java` içine yeni enum değeri eklenir.
2. `backend/src/main/java/com/meslite/domain/material/MaterialService.java` içindeki `generateTrackingCode()` methoduna sektör prefix’i tanımlanır.
3. Flyway migration ile `departments.sector_type` check constraint’i yeni değerle güncellenir.
4. Gerekliyse yeni seed departmanları `V4__seed_data.sql` içine eklenir.
5. Frontend form seçenekleri sektör listesine göre genişletilir.

Bu yaklaşımda mevcut `Material`, `Department`, `Machine` ve `ProductionRecord` çekirdeği değişmeden kalır; yalnızca enum ve konfigürasyon tarafı genişletilir.

## Önemli Dosyalar

- Backend giriş noktası: [MesLiteApplication.java](/Users/efe/Desktop/uretim360/backend/src/main/java/com/meslite/MesLiteApplication.java)
- Güvenlik yapılandırması: [SecurityConfig.java](/Users/efe/Desktop/uretim360/backend/src/main/java/com/meslite/config/SecurityConfig.java)
- Auth akışı: [auth.ts](/Users/efe/Desktop/uretim360/frontend/lib/auth.ts)
- Dashboard ekranı: [page.tsx](/Users/efe/Desktop/uretim360/frontend/app/(dashboard)/dashboard/page.tsx)
- Compose dosyası: [docker-compose.yml](/Users/efe/Desktop/uretim360/docker-compose.yml)
- Çalıştırma rehberi: [CALISTIRMA.md](/Users/efe/Desktop/uretim360/CALISTIRMA.md)

