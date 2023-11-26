## Matrix Jitsi-admin Bot

Dies ist ein Bot, der für die Verwaltung von Jitsi-Meetings über Matrix erstellt wurde. Der Bot ermöglicht die Steuerung und Verwaltung von Meetings über eine Matrix-Instanz.

### Installation

#### Token erstellen

1. Klonen des Repositorys:

   ```
   git clone https://de-h2-git01.h2.home/emanuel.holzmann/matrix-bot.git
   ```

2. Installation der benötigten Pakete:

   ```
   npm install
   ```

3. Generieren des Tokens:

   Führen Sie den folgenden Befehl aus und ersetzen Sie `username`, `passwort` und `https://matrixdomain.org` durch die entsprechenden Anmeldeinformationen:

   ```shell
   MATRIX_USERNAME=username MATRIX_PASSWORD=passwort MATRIX_URL=https://matrixdomain.org node login.mjs 
   ```

   Der generierte Access-Token muss sicher aufbewahrt werden, da er der Schlüssel für den Docker-Container ist.

#### Container starten

1. Erneutes Checkout der Anwendung (optional, wenn bereits geklont):

   ```
   git clone https://de-h2-git01.h2.home/emanuel.holzmann/matrix-bot.git
   ```

2. Wechseln in das Verzeichnis:

   ```
   cd matrix-bot
   ```

3. Bauen der Anwendung und Starten des Containers mit `docker-compose`:

   Führen Sie den folgenden Befehl aus und ersetzen Sie `tokenKommtHIerHer` durch den generierten Accesstoken aus Schritt 1, `https://matrixdomain.org` und `https://jitsi-admin-url.de` müssen durch reale URLs ersetzt werden:

   ```shell
   MATRIX_TOKEN=tokenKommtHIerHer MATRIX_URL=https://matrixdomain.org JITSI_ADMIN_URL=https://jitsi-admin-url.de docker-compose up --build -d
   ```

4. Berechtigungen für das Volume festlegen:

   ```shell
   chown -R 1000:1000 /var/lib/docker/volumes/matrix-bot_secret_data/
   ```

### Hinweise

Stellen Sie sicher, dass die Umgebungsvariablen korrekt gesetzt sind und die Zugangsdaten sicher behandelt werden. Der Bot ermöglicht die Verwaltung von Jitsi-Meetings über Matrix und kann entsprechend konfiguriert werden.

---

Bitte beachten Sie, dass die Pfadangaben, Token und URLs entsprechend Ihren tatsächlichen Konfigurationen und Anforderungen angepasst werden müssen.