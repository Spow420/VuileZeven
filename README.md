# Vuile Zeven - Online Multiplayer Kaartspel

Een online multiplayer versie van het klassieke Nederlandse kaartspel Vuile Zeven.

## 🎮 Spelregels

- **Doel**: Zorg dat je als eerste al je kaarten kwijt bent
- **Spelers**: 2-4 spelers
- **Start**: Elke speler krijgt 7 kaarten

### Basis regels:
- Je moet een kaart spelen met dezelfde kleur OF hetzelfde getal als de bovenste kaart
- Als je geen kaart kunt spelen, moet je een kaart trekken
- Je kunt na het trekken van een kaart deze niet meteen spelen

### Speciale kaarten:
- **7**: De volgende speler moet 2 kaarten trekken. Als die speler ook een 7 heeft (van de juiste kleur of waarde) kan dit gestapeld worden! (2 zevens = 4 kaarten, 3 zevens = 6 kaarten)
- **Aas**: De volgende speler wordt overgeslagen (geskipt). Als er een 7 ligt en je gooit een Aas, gaat de 7 naar de speler erna (omdat de volgende geskipped wordt)
- **10**: Gaat 1 keer achteruit en dan terug naar jou. Als er een 7 ligt en je gooit een 10, kaatst de 7 terug naar degene die hem gooide! 
- **Boer (J)**: Je kunt de kleur (suit) veranderen naar wat je wilt

## 🚀 Hoe te starten

### Installatie:

1. Open een terminal in deze map
2. Run: `npm install`

### Server starten:

```bash
npm start
```

De server draait nu op: http://localhost:3000

### Spelen met vrienden:

1. Open je browser en ga naar http://localhost:3000
2. Vul je naam in en bedenk een room code (bijvoorbeeld: SPEL123)
3. Deel de room code met je vrienden
4. Als iedereen in de lobby is, klik op "Start Spel"
5. Veel plezier!

## 📝 Opmerkingen

- Je hebt Node.js nodig om dit spel te draaien
- Alle spelers moeten op hetzelfde netwerk zitten, of je moet port forwarding instellen
- Voor het spelen over internet kun je services zoals ngrok gebruiken

## 🔧 Aanpassingen maken

De belangrijkste bestanden:
- `server.js` - Server logica en spelregels
- `public/game.js` - Client-side logica
- `public/style.css` - Styling en design
- `public/index.html` - HTML structuur

Je kunt alles aanpassen naar je eigen smaak!
