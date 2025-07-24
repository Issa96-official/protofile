# 🚀 PostgreSQL Setup för Render

## Snabbguide för att koppla PostgreSQL till din app:

### 1. **Skapa PostgreSQL databas i Render:**
   ```
   1. Gå till: https://dashboard.render.com/
   2. Klicka: "New +" → "PostgreSQL"
   3. Namn: "social-media-database" 
   4. Plan: "Free" (0$/månad)
   5. Klicka: "Create Database"
   ```

### 2. **Koppla till din web service:**
   ```
   1. Gå till din web service (där appen körs)
   2. Klicka: "Environment" i vänstermenyn
   3. Klicka: "Add Environment Variable"
   4. Key: DATABASE_URL
   5. Value: [Kopiera "External Database URL" från PostgreSQL service]
   ```

### 3. **Automatisk deployment:**
   - Render deployar automatiskt när du sparar
   - Servern startar med fungerande databas
   - Inlogg: admin / admin123

## ✅ Resultat efter setup:
- ✅ Databas fungerar
- ✅ Inga 500-fel
- ✅ All funktionalitet aktiverad
- ✅ Data sparas permanent

## 🔍 Kontrollera att det fungerar:
Loggar ska visa:
```
✅ PostgreSQL anslutning lyckades
🗄️ PostgreSQL databas ansluten och funktionell
Databastabeller skapade/kontrollerade
Standardanvändare skapad: admin / admin123
```
