# MES-Lite Nasıl Çalıştırılır

## 1. Ortam dosyasını hazırla

```bash
cp .env.example .env
```

İstersen `.env` içindeki değerleri değiştirebilirsin. Varsayılan değerler lokal kullanım için hazırdır.

## 2. Tüm sistemi Docker ile ayağa kaldır

```bash
docker compose up --build
```

Bu komut:

1. PostgreSQL konteynerini başlatır.
2. Backend Spring Boot servisini build eder ve migration’ları çalıştırır.
3. Frontend Next.js uygulamasını build edip yayınlar.

## 3. Uygulamayı aç

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:1453](http://localhost:1453)

## 4. Demo giriş bilgileri

- `admin@meslite.com` / `Test1234!`
- `manager@meslite.com` / `Test1234!`
- `supervisor1@meslite.com` / `Test1234!`
- `operator1@meslite.com` / `Test1234!`

## 5. Kapatma

```bash
docker compose down
```

Veritabanı verisini de temizlemek istersen:

```bash
docker compose down -v
```

## 6. Docker kullanmadan geliştirme

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Bu senaryoda backend `http://localhost:1453`, frontend `http://localhost:3000` adresinde çalışır.

## 7. Olası Notlar

- Maven veya npm bağımlılıkları ilk build sırasında internet erişimi ister.
- Backend JWT secret değeri kısa olmamalıdır; örnek `.env.example` içinde uygun uzunlukta verilmiştir.
- Frontend login akışı için `NEXTAUTH_URL` ve `API_INTERNAL_URL` değerleri doğru kalmalıdır.
