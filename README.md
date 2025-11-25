## Matrix Jitsi-admin Bot

Dies ist ein Bot, der für die Verwaltung von Jitsi-Meetings über Matrix erstellt wurde. Der Bot ermöglicht die Steuerung und Verwaltung von Meetings über eine Matrix-Instanz.

### Nutzung

#### Container starten

1. Klonen des Repositorys:

   ```shell
   git clone https://github.com/H2-invent/jitsi-admin-matrix-bot
   ```

1. Wechseln in das Verzeichnis:

   ```shell
   cd matrix-bot
   ```
   
1. Umgebungsvariablen setzen:

    Führen Sie den folgenden Befehl aus und ersetzen Sie die Werte in `.env` mit der eigenen Konfiguration
    ```shell
   cp .env.example .env
   ```

1. Bauen der Anwendung und Starten des Containers mit `docker compose`:

   ```shell
   docker compose up --build -d
   ```
   

#### Spezielle Kommandos per Socket

Sie können dem Bot per Unix Socket Kommandos schicken, während er läuft und online ist. Er befindet sich unter `/run/jitsi-admin-matrix-bot/command.sock`

##### Einfache Verwendung mit dem socket-command Script

Das mitgelieferte Script `socket-command` bietet eine benutzerfreundliche Möglichkeit, Kommandos an den Bot zu senden:

```shell
# Interaktiver Modus - zeigt Menü mit verfügbaren Kommandos
docker compose exec matrix-bot ./socket-command

# Direktes Senden eines Kommandos per Name
docker compose exec matrix-bot ./socket-command i-am-back

# Hilfe anzeigen
docker compose exec matrix-bot ./socket-command --help
```

##### Manuelle Verwendung

- Ich bin wieder zurück!
  - `i-am-back`
  - Auf dem Server: `echo 'i-am-back' | socat - /run/jitsi-admin-matrix-bot/command.sock`
  - Docker Compose: `docker compose exec matrix-bot sh -c "echo 'i-am-back' | socat - /run/jitsi-admin-matrix-bot/command.sock"`

### Hinweise

Stellen Sie sicher, dass die Umgebungsvariablen korrekt gesetzt sind und die Zugangsdaten sicher behandelt werden. Der Bot ermöglicht die Verwaltung von Jitsi-Meetings über Matrix und kann entsprechend konfiguriert werden.

---

Bitte beachten Sie, dass die Pfadangaben, Token und URLs entsprechend Ihren tatsächlichen Konfigurationen und Anforderungen angepasst werden müssen.
