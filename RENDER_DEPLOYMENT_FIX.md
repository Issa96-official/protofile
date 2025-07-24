# 🚀 Render.com Deployment Guide - PostgreSQL Setup

## ❌ Problem: ECONNREFUSED error

Din app försöker ansluta till en PostgreSQL-databas som inte finns än. Här är lösningen:

## ✅ Steg-för-steg lösning:

### 1. **Skapa PostgreSQL-databas i Render**

1. **Gå till Render Dashboard**: https://dashboard.render.com/
2. **Klicka "New +"** (uppe till höger)
3. **Välj "PostgreSQL"**
   
   ![PostgreSQL Selection](https://render.com/docs/images/postgres-create.png)

4. **Konfigurera databasen**:
   - **Name**: `social-media-db` (eller valfritt namn)
   - **Database**: `social_media_db`
   - **User**: `social_user` (eller valfritt)
   - **Region**: Samma som din web service
   - **Plan**: **Free** (0$/månad, 1GB storage)

5. **Klicka "Create Database"**

### 2. **Koppla databasen till din web service**

1. **Gå till din web service** (den som visar deploy-felet)
2. **Klicka på "Environment"** i vänstermenyn
3. **Lägg till Environment Variable**:
   - **Key**: `DATABASE_URL`
   - **Value**: 
     - **Klicka på din PostgreSQL service**
     - **Kopiera "External Database URL"** (börjar med `postgresql://`)
     - **Klistra in i Value-fältet**

### 3. **Alternativ: Automatisk länkning**

1. **I din web service, gå till "Environment"**
2. **Klicka "Link to Database"**
3. **Välj din PostgreSQL service**
4. **Render sätter automatiskt DATABASE_URL**

### 4. **Trigger ny deployment**

1. **Gå till "Manual Deploy"**
2. **Klicka "Deploy latest commit"**
3. **Eller push en ny commit till GitHub**

## 🔍 Verifiera installation:

Efter deployment, kolla loggar för:
```
✅ PostgreSQL anslutning lyckades
🗄️ PostgreSQL databas ansluten
Databastabeller skapade/kontrollerade
Standardanvändare skapad: admin / admin123
🚀 Server körs på port 10000
```

## 💡 Snabb fix för omedelbar deployment:

Om du vill att appen ska starta UTAN databas först:

1. **Sätt environment variable**:
   - **Key**: `SKIP_DB_CHECK`
   - **Value**: `true`

2. **Detta låter servern starta utan databas**
3. **Lägg till DATABASE_URL senare**

## 🆘 Felsökning:

### Fel: "connection string must be provided"
- ✅ Kontrollera att DATABASE_URL är satt korrekt
- ✅ URL ska börja med `postgresql://`

### Fel: "password authentication failed"
- ✅ Använd External Database URL, inte Internal
- ✅ Kopiera hela URL:en inklusive användarnamn och lösenord

### Fel: "database does not exist"
- ✅ PostgreSQL service måste vara "Available" innan du använder den
- ✅ Vänta 2-3 minuter efter skapande

## 📋 Checklista:

- [ ] PostgreSQL service skapad i Render
- [ ] DATABASE_URL kopierad från PostgreSQL service
- [ ] Environment variable DATABASE_URL satt i web service
- [ ] Ny deployment triggrad
- [ ] Loggar visar framgångsrik databasanslutning
- [ ] Kan logga in med admin/admin123

## 🎯 Snabblänkar:

- **Render Dashboard**: https://dashboard.render.com/
- **Create PostgreSQL**: Dashboard → New + → PostgreSQL
- **Environment Variables**: Your Web Service → Environment
- **Deploy Logs**: Your Web Service → Events → View Logs

**Efter dessa steg ska din app fungera perfekt på Render! 🎉**
