# PostgreSQL Migration Guide

Denna applikation har migrerats från SQLite till PostgreSQL för bättre prestanda och produktionsanvändning.

## 🚀 Lokal utveckling

### Alternativ 1: Utan lokal PostgreSQL (Rekommenderat för testning)

Använd en gratis PostgreSQL-databas online:

1. **Skapa konto på ElephantSQL** (gratis tier):
   - Gå till https://www.elephantsql.com/
   - Skapa konto och ny databas
   - Kopiera DATABASE_URL

2. **Uppdatera .env-filen**:
   ```bash
   DATABASE_URL=ditt-elephantsql-url-här
   NODE_ENV=development
   SESSION_SECRET=local-development-secret-key
   ```

### Alternativ 2: Lokal PostgreSQL installation

1. **Installera PostgreSQL**:
   - Windows: Ladda ner från https://www.postgresql.org/download/windows/
   - Skapa databas: `social_media_db`

2. **Uppdatera .env-filen**:
   ```bash
   DATABASE_URL=postgresql://postgres:ditt-lösenord@localhost:5432/social_media_db
   NODE_ENV=development
   SESSION_SECRET=local-development-secret-key
   ```

## ⚙️ Render.com deployment

1. **Skapa PostgreSQL service i Render**:
   - Gå till Render Dashboard
   - Klicka "New +" → "PostgreSQL"
   - Välj gratis plan
   - Skapa service

2. **Koppla till din webb-service**:
   - Gå till din webb-service inställningar
   - Lägg till Environment Variable:
     - `DATABASE_URL` = (kopieras automatiskt från PostgreSQL service)

3. **Deploy**:
   - Ändringarna kommer automatiskt trigga en ny deployment
   - Databasen initialiseras automatiskt med tabeller och standardanvändare

## 📊 Databasstruktur

### Users-tabell:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Social_links-tabell:
```sql
CREATE TABLE social_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    icon_class VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Viktiga ändringar från SQLite

- **Parameter binding**: `?` → `$1, $2, $3`
- **Boolean values**: `1/0` → `true/false`
- **Auto increment**: `AUTOINCREMENT` → `SERIAL`
- **Data types**: `TEXT` → `VARCHAR(n)`, `DATETIME` → `TIMESTAMP`
- **Connection**: Callback-based → Promise-based med async/await

## 🐛 Felsökning

### Anslutningsproblem:
```bash
# Testa anslutning
npm start
# Leta efter: "PostgreSQL anslutning lyckades"
```

### SSL-problem i produktion:
Render PostgreSQL kräver SSL. Detta hanteras automatiskt i `config/database.js`.

### Migrering av befintlig data:
Om du har viktig data i SQLite, kontakta mig för hjälp med datamigrering.

## ✅ Kontrollista

- [ ] PostgreSQL databas skapad (lokalt eller online)
- [ ] .env-fil konfigurerad med DATABASE_URL
- [ ] `npm install` kört
- [ ] Server startar utan fel
- [ ] Kan logga in med admin/admin123
- [ ] Alla funktioner fungerar (profil, sociala medier, lösenord)
- [ ] Render deployment fungerar
