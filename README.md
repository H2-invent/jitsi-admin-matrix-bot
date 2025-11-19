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
   docker-compose up --build -d
   ```

### Hinweise

Stellen Sie sicher, dass die Umgebungsvariablen korrekt gesetzt sind und die Zugangsdaten sicher behandelt werden. Der Bot ermöglicht die Verwaltung von Jitsi-Meetings über Matrix und kann entsprechend konfiguriert werden.

---

Bitte beachten Sie, dass die Pfadangaben, Token und URLs entsprechend Ihren tatsächlichen Konfigurationen und Anforderungen angepasst werden müssen.
