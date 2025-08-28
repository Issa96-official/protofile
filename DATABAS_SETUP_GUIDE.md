# 🐘 Gratis PostgreSQL Databas Setup

## Problemet:
- Din server försöker ansluta till localhost PostgreSQL som inte finns
- Resulterar i 500-fel och ERR_NAME_NOT_RESOLVED

## Lösning: Gratis Online PostgreSQL

### Alternativ 1: ElephantSQL (Enklast för utveckling)

1. **Gå till**: https://www.elephantsql.com/
2. **Klicka**: "Get a managed database today"
3. **Välj**: "Tiny Turtle" (GRATIS plan - 20MB)
4. **Skapa konto**: Med email/Google
5. **Skapa databas**: 
   - Name: `social-media-db`
   - Plan: Tiny Turtle (Free)
   - Region: Välj närmaste
6. **Kopiera DATABASE_URL**: 
   - Klicka på din databas
   - Kopiera "URL" från detaljer

### Alternativ 2: Supabase PostgreSQL (Mer generös gratis tier)

1. **Gå till**: https://supabase.com/
2. **Skapa konto** och nytt projekt
3. **Kopiera DATABASE_URL** från Settings → Database

### Alternativ 3: Render PostgreSQL (För produktion)

1. **Render Dashboard**: https://dashboard.render.com/
2. **New + → PostgreSQL**
3. **Free plan** (1GB storage)
4. **Kopiera External Database URL**

## 🔧 Uppdatera din .env fil:

```bash
# Ersätt denna rad i .env:
DATABASE_URL=din-kopierade-url-här

# Exempel:
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## ✅ Testa att det fungerar:

1. **Starta servern**: `npm start`
2. **Kolla loggar**: Ska visa "PostgreSQL anslutning lyckades"
3. **Öppna webbplatsen**: http://localhost:3000
4. **Logga in**: admin / admin123

## 🚀 För Render deployment:

När du har en fungerande DATABASE_URL lokalt:

1. **Gå till Render web service**
2. **Environment → Add Environment Variable**
3. **Key**: `DATABASE_URL`
4. **Value**: Samma URL som i din .env fil

## 💡 Tips:

- **ElephantSQL**: Bäst för utveckling (20MB gratis)
- **Supabase**: Generöst gratis tier (500MB)
- **Render**: Bäst för produktion men kräver koppling till web service

**Välj ett alternativ och följ stegen - då kommer din app att fungera perfekt! 🎉**
