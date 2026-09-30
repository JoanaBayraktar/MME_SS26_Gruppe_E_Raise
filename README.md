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

Raise unterstützt Lehrveranstaltungen mit einem gemeinsamen Live-Bereich für Studierende und Dozent:innen. Die Anwendung umfasst aktuell folgende Funktionen:

#### Anmeldung und Rollen
- Dozent:innen können einen Account erstellen und sich anmelden.
- Studierende benötigen keinen Account und können einer laufenden Session über einen Session-Code bzw. QR-Code beitreten.
- Die Ansichten und Funktionen unterscheiden sich abhängig von der jeweiligen Rolle.

#### Konto-Verwaltung
- Dozent:innen können ihre Profildaten (Vorname, Nachname, E-Mail) jederzeit bearbeiten.
- Das Passwort kann über einen eigenen Dialog geändert werden, inklusive Live-Prüfung auf Mindestlänge und übereinstimmende Wiederholung.
- Der Account kann über eine zweistufige Bestätigung unwiderruflich gelöscht werden.

#### Veranstaltungsverwaltung
- Dozent:innen können Veranstaltungen mit Name und Kürzel erstellen.
- Alle zugeordneten Veranstaltungen werden im Dashboard übersichtlich dargestellt.
- Zu Veranstaltungen können mehrere Sessions angelegt und verwaltet werden.
- Weitere Dozent:innen können mit einer Veranstaltung verknüpft und später wieder entfernt werden.
- Verknüpfte Dozent:innen erhalten Zugriff auf die zugehörigen Sessions und Moderationsfunktionen.

#### Session-Management
- Sessions können für Veranstaltungen geplant werden, entweder mit automatischem Start/Ende im festgelegten Zeitraum oder mit manuellem Start durch die Dozent:innen.
- Für laufende Sessions werden ein Session-Code und ein QR-Code zum Beitritt bereitgestellt.
- Dozent:innen können direkt aus der Session-Verwaltung in die Live-Ansicht wechseln.
- Manuell gestartete Sessions können mit Bestätigungsdialog beendet werden, laufende Sessions werden anschließend archiviert.

#### Live Q&A
- Studierende können innerhalb einer Session Fragen stellen.
- Fragen können von anderen Studierenden hochgevotet und kommentiert werden.
- Dozent:innen können Fragen moderieren, kommentieren und ihren Bearbeitungsstatus ändern.
- Dozent:innen-Kommentare werden in der Oberfläche hervorgehoben.
- Fragen können unter anderem als neu, gefragt, beantwortet oder irrelevant gekennzeichnet werden.

#### Umfragen und Abstimmungen
- Ist keine Umfrage aktiv, sehen Studierende einen Warteraum mit automatischer Aktualisierung und Pull-to-Refresh.
- Aktive Umfragen unterstützen Single Choice, Multiple Choice und Skalenfragen.
- Studierende können ihre Stimme anonym abgeben.
- Mehrfachabstimmungen derselben Person für eine Umfrage werden verhindert.
- Nach der Abstimmung werden die aktuellen Ergebnisse als Balkendiagramm mit Prozentwerten und absoluten Stimmenzahlen dargestellt.
- Die Ergebnisse werden automatisch aktualisiert.
- Dozent:innen können die Live-Ergebnisse während der laufenden Session einsehen.

#### Archiv
- Beantwortete bzw. abgeschlossene Inhalte können archiviert werden.
- Archivierte Fragen können später erneut eingesehen und recherchiert werden.

## Testen der Anwendung

Nach dem Start über Docker ist die Anwendung unter `http://localhost:5173` erreichbar.

#### 1. Dozent:innen-Account erstellen

1. `http://localhost:5173/register` öffnen.
2. Vorname, Nachname, E-Mail-Adresse und ein Passwort mit mindestens acht Zeichen eingeben.
3. Den Account erstellen.
4. Nach erfolgreicher Registrierung öffnet sich automatisch das Dozent:innen-Dashboard.

Alternativ kann ein bestehender Account über `http://localhost:5173/login` verwendet werden.

#### 2. Veranstaltung erstellen

1. Im Dozent:innen-Dashboard eine neue Veranstaltung erstellen.
2. Einen Namen und ein Kürzel eingeben.
3. Die Veranstaltung speichern.
4. Prüfen, ob sie anschließend im Dashboard und in der Veranstaltungsübersicht erscheint.

Optional kann in den Veranstaltungsdetails eine weitere dozierende Person über ihre E-Mail-Adresse hinzugefügt werden.

#### 3. Session erstellen und starten

1. Innerhalb einer Veranstaltung eine neue Session erstellen.
2. Datum und Session-Daten festlegen.
3. Die Session öffnen bzw. starten.
4. In der Live-Ansicht werden der Session-Code und ein QR-Code zum Beitritt angezeigt.

#### 4. Studierenden-Ansicht testen

Für einen möglichst realistischen Test empfiehlt es sich, ein zweites Browserfenster oder ein Inkognito-Fenster zu verwenden.

1. Auf der Startseite die Option zum Beitreten als Student:in auswählen.
2. Den Session-Code der laufenden Session eingeben.
3. Prüfen, ob die laufende Session geöffnet wird.

#### 5. Fragenmodul testen

In der Studierenden-Ansicht:

1. Eine neue Frage erstellen.
2. Optional Kapitel oder Foliennummer angeben.
3. Eine vorhandene Frage hochvoten.
4. Eine Frage kommentieren.

In der Dozent:innen-Ansicht:

1. Den Fragenfeed der laufenden Session öffnen.
2. Die neu erstellte Frage prüfen.
3. Den Status der Frage verändern.
4. Einen Dozent:innen-Kommentar hinzufügen.
5. Prüfen, ob Änderungen auch in der Studierenden-Ansicht erscheinen.

#### 6. Umfragen testen

In der Dozent:innen- bzw. vorbereiteten Session-Ansicht eine aktive Umfrage verwenden.

In der Studierenden-Ansicht:

1. Den Tab `Umfrage` öffnen.
2. Ohne aktive Umfrage prüfen, ob der Hinweis `Keine aktive Umfrage vorhanden` angezeigt wird.
3. Eine aktive Umfrage aufrufen.
4. Eine oder mehrere Antwortoptionen entsprechend dem Umfragetyp auswählen.
5. Auf `Abstimmen` klicken.
6. Prüfen, ob eine erneute Abstimmung verhindert wird.
7. Prüfen, ob anschließend die Live-Ergebnisse mit Balken, Prozentwerten und absoluten Stimmenzahlen erscheinen.

Mit einem zweiten Browser bzw. einer weiteren Studierenden-Session kann eine weitere Stimme abgegeben werden. Die Ergebnisanzeige sollte sich anschließend automatisch aktualisieren.

#### 7. Session beenden

1. In der Dozent:innen-Ansicht die laufende Session beenden.
2. Prüfen, ob die Session nicht mehr als aktiv angezeigt wird.
3. Archivierte bzw. abgeschlossene Inhalte anschließend über die entsprechenden Archivansichten prüfen.

#### 8. Konto-Verwaltung testen

1. In der Dozent:innen-Ansicht auf `Account` wechseln.
2. Vorname, Nachname oder E-Mail-Adresse ändern und speichern.
3. Über `Passwort ändern` das aktuelle und ein neues Passwort eingeben; prüfen, ob Mindestlänge und übereinstimmende Wiederholung live angezeigt werden.
4. Abmelden und mit dem neuen Passwort erneut einloggen.

## Zuständigkeiten
- **Joana Bayraktar:** Onboarding & Authentifizierung, Session-Management & Navigation
- **Philomena:** Veranstaltungsverwaltung, Umfragen & Abstimmungen
- **Johannes Gaul:** Live Q&A / Fragen-Modul, Archiv & Recherche
