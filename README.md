# Multimedia Engineering - Sommersemester 2026 - Uni Regensburg
Raise ist eine webbasierte Plattform zur Organisation von Fragen in Lehrveranstaltungen. Studierende können Fragen anonym einreichen, bewerten und kommentieren. Dozierende priorisieren und beantworten diese, verwalten ihren Status und bündeln sie für kommende Sitzungen. Beantwortete Fragen werden in einer durchsuchbaren Wissensdatenbank archiviert.

## Anforderungen
Vorlesung-Ticketing & Q&A Board (Überthema: Forschung & Lehre)
Ein Tool zur Organisation von Fragen vor und während einer Vorlesung.
- Fragen-Priorisierung: Studierende posten Fragen (optional anonym); andere können diese hochvoten (Upvoting-System) und kommentieren. Dozenten können auch kommentieren, dieser Kommentar wird besonders hervorgehoben.
- Status-Management von Dozierenden: Markierung von Fragen als "In Bearbeitung", “Beantwortet" oder “Irrelevant".
- Dashboard Dozierende: Erstellung von Kursen mit Q&A Board.
- User Management: Studierende benötigen keinen Account, nur URL zu Kurs. Dozenten benötigen Account.
- Wissens-Archiv mit Suchfunktion: Automatische Übernahme gelöster Fragen in eine nach Kapiteln sortierte FAQ.
- Session-Planning: Dozenten können Fragen zu "Themenblöcken" für die nächste Sitzung gruppieren.
- Mögliche Erweiterungen: Integration von Tutoren.

## Tech-Stack
**Frontend:** React + TypeScript, Tailwind CSS, react-router-dom, react-hook-form + zod, @dnd-kit/core, recharts, socket.io-client, lucide-react
**Backend:** Node.js + Express, TypeScript, Prisma ORM, PostgreSQL, socket.io, bcrypt + express-session, zod, qrcode

## Projektstruktur
```
/frontend   React-App (Vite)
/backend    Express-API + Prisma-Schema
docker-compose.yml
```

## Installation
Voraussetzung: Docker & Docker Compose.

```bash
docker-compose up
```

Das startet Frontend (http://localhost:5173), Backend (http://localhost:4000) und eine PostgreSQL-Datenbank. Das Datenbankschema wird beim ersten Start automatisch angelegt, es sind keine weiteren Kommandos nötig.

## Features
Aktueller Stand: Projekt-Grundgerüst (Repo-Struktur, Docker-Setup, Datenbankschema). Die einzelnen Features werden über die verlinkten GitHub Issues umgesetzt und hier ergänzt, sobald sie fertig sind.

## Testen
Wird ergänzt, sobald die ersten Features umgesetzt sind.

## Zuständigkeiten
- **Joana Bayraktar:** Onboarding & Authentifizierung, Session-Management & Navigation
- **Philomena:** Veranstaltungsverwaltung, Umfragen & Abstimmungen
- **Johannes Gaul:** Live Q&A / Fragen-Modul, Archiv & Recherche
