# 🌟 Sociala Medier Webbplats

En modern och responsiv webbplats för att visa dina sociala mediekonton med en säker admin-panel för hantering.

![Webbplats Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Social+Media+Website)

## ✨ Funktioner

- **🎨 Modern Design**: Glassmorfism-effekter med gradient-bakgrunder och animationer
- **🌙 Dark Mode**: Automatisk tema-växling med localStorage-sparning
- **📱 Responsiv**: Perfekt design på alla enheter (mobil, tablet, desktop)
- **🔐 Säker Admin-panel**: Lösenordsskyddad hantering av innehåll
- **📸 Filhantering**: Säker uppladdning av profilbilder
- **✅ Realtidsvalidering**: Omfattande validering både frontend och backend
- **💾 SQLite Databas**: Lätt att hantera och säkerhetskopiera

## �️ Teknologi Stack

### Frontend
- **HTML5** - Semantisk markup
- **CSS3** - Modern styling med flexbox, grid, och custom properties
- **Vanilla JavaScript** - ES6+ med modulär kod
- **Font Awesome** - Professionella ikoner

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lätt databas
- **bcryptjs** - Lösenordshashing
- **express-session** - Sessionshantering
- **express-validator** - Input-validering
- **multer** - Filuppladdning

## �🚀 Snabbstart

### Förutsättningar
- Node.js (version 14 eller högre)
- npm (kommer med Node.js)

### Installation

1. **Klona repository**:
   ```bash
   git clone https://github.com/DITT-ANVÄNDARNAMN/sociala-medier-webbplats.git
   cd sociala-medier-webbplats
   ```

2. **Installera dependencies**:
   ```bash
   npm install
   ```

3. **Starta servern**:
   ```bash
   npm start
   ```

4. **Öppna webbläsaren**:
   - Huvudsida: http://localhost:3000
   - Admin-panel: http://localhost:3000/admin

## 🔐 Standard Inloggning

```
Användarnamn: admin
Lösenord: admin123
```

⚠️ **VIKTIGT**: Ändra lösenordet direkt efter första inloggningen via admin-panelen!

## � Användning

### Huvudsida
- Visa din profil med namn och bild
- Lista alla aktiva sociala medielänkar
- Responsiv design som anpassar sig till alla skärmstorlekar
- Dark mode-växling i övre högra hörnet

### Admin-Panel
1. **Profil-hantering**:
   - Redigera ditt namn
   - Ladda upp och ändra profilbild
   - Förhandsgranska ändringar

2. **Sociala Medielänkar**:
   - Lägg till nya länkar (Facebook, Instagram, Twitter, etc.)
   - Redigera befintliga länkar
   - Aktivera/inaktivera länkar
   - Ändra visningsordning
   - Ta bort länkar

3. **Säkerhetsinställningar**:
   - Ändra admin-lösenord
   - Säker utloggning

## 🎨 Design-funktioner

- **Glassmorfism**: Moderna genomskinliga element med blur-effekter
- **Gradient-bakgrunder**: Vackra färgövergångar med animationer
- **Hover-animationer**: Mjuka övergångar på alla interaktiva element
- **Dark Mode**: Komplett dark theme för alla komponenter
- **Responsiv typografi**: Skalar perfekt på alla enheter

## 📁 Projektstruktur

```
├── server.js              # Huvudserver med Express och API routes
├── package.json           # Dependencies och scripts
├── database.db            # SQLite databas (skapas automatiskt)
├── public/                 # Statiska filer
│   ├── index.html         # Huvudsida
│   ├── login.html         # Inloggningssida  
│   ├── admin.html         # Admin-panel
│   ├── css/
│   │   └── style.css      # Alla stilar med dark mode
│   ├── js/
│   │   ├── main.js        # Huvudsidans funktionalitet
│   │   ├── login.js       # Inloggning med tema-stöd
│   │   └── admin.js       # Admin-panelens funktioner
│   └── uploads/           # Uppladdade profilbilder
└── README.md              # Denna fil
```

## 🔒 Säkerhetsfunktioner

- **Lösenordshashing**: bcrypt för säker lösenordslagring
- **Sessionshantering**: Express sessions för autentisering
- **Input-validering**: Omfattande validering med express-validator
- **Filvalidering**: Endast bildformat tillåtna för uppladdning
- **SQL-injection skydd**: Parametriserade queries
- **XSS-skydd**: Sanitisering av all användarinput

## 🌐 Produktion

### Säkerhetsinställningar

1. **Ändra session-hemlighet** i `server.js`:
   ```javascript
   secret: 'din-mycket-säkra-hemliga-nyckel'
   ```

2. **Aktivera HTTPS**:
   ```javascript
   cookie: { secure: true }
   ```

3. **Environment Variables**:
   ```bash
   SESSION_SECRET=din-säkra-nyckel
   PORT=3000
   NODE_ENV=production
   ```

## 🤝 Bidrag

1. Fork projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branch (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📞 Support

Om du stöter på problem:

1. Kontrollera att Node.js är installerat: `node --version`
2. Kontrollera att port 3000 är tillgänglig
3. Kontrollera serverloggar i terminalen
4. Öppna browser console (F12) för frontend-fel

## 📄 Licens

MIT License - Du är fri att använda, modifiera och distribuera detta projekt.

---

**Utvecklad med ❤️ för att visa dina sociala mediekonton på bästa sätt!**

## 🏷️ Tags

`javascript` `nodejs` `express` `sqlite` `social-media` `admin-panel` `responsive-design` `dark-mode` `glassmorphism`
