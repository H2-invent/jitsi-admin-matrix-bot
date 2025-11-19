import { md5 } from 'js-md5'
import config from './config.mjs'

export default class conferenceUtils {
    client

    constructor(client) {
        this.client = client
    }

    async createConference(roomId) {
        const roomDescription = await this.getRoomTopic(roomId)
        const escapedBaseUrl = config.JITSI_ADMIN_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedBaseUrl + '[^\\s\\n]+')
        const match = roomDescription.match(regex)
        if (match) {
            return match[0]
        }

        let hash = md5(roomId)
        return config.JITSI_ADMIN_URL + '/m/' + hash
    }

    async sendMessageWithUrl(roomId) {
        const url = await this.createConference(roomId)
        await this.client.sendText(roomId, 'Die Konferenz für diesen Raum läuft unter dieser URL: ' + url)
    }

    async sendJoinConference(roomId) {
        const url = await this.createConference(roomId)
        await this.client.sendHtmlText(roomId, '<a href ="' + url + '">Hier der Konferenz beitreten</a> ')
    }

    async inviteAll(roomId) {
        const url = await this.createConference(roomId)
        const text =
            '@room <h2>Diese Konferenz startet gerade</h2><br><a href="' +
            url +
            '">➡️Jetzt dieser Konfernz beitreten</a>'
        await this.client.sendHtmlText(roomId, text)
    }

    async changeRoomName(roomId) {
        const roomDescription = await this.getRoomTopic(roomId)
        const conferenceUrl = await this.createConference(roomId)

        if (!roomDescription.includes(conferenceUrl)) {
            try {
                await this.client.sendStateEvent(roomId, 'm.room.topic', '', {
                    topic: roomDescription + '\n\r' + conferenceUrl,
                })
            } catch (e) {
                await this.client.sendText(
                    roomId,
                    'Der Bot benötigt die Berechtigung "Moderator" um das Raumthema ändern zu dürfen.'
                )
            }
        }
    }

    async sendHelp(roomId) {
        await this.client.sendText(
            roomId,
            'Neue Konferenz erstellen: !jitsi\n\r' +
                'Direkt der Konferenz beitreten: !join\n\r' +
                'Konferenz für alle starten: !starten\n\r' +
                'Diese Hilfeseite anzeigen: !hilfe\n\r'
        )
    }

    async getRoomTopic(roomId) {
        let roomDescription = ''
        try {
            roomDescription = await this.client.getRoomStateEvent(roomId, 'm.room.topic')
            roomDescription = roomDescription.topic
        } catch (e) {}
        return roomDescription
    }

    async sendVersion(roomId) {
        this.client.sendText(roomId, 'Version: ' + config.BOT_VERSION)
    }

    async sendWelcome(roomId) {
        let text =
            '<h2>Hallo, ich bin der Raumassistent.</h2><br> Ein Teammitglied hat mich in diesen Raum eingeladen.<br><br>'

        if (config.SHOW_WARNING_OF_MIM) {
            text +=
                '⚠️ Kleiner Disclaimer zu Beginn: Ich kann <b>alle Nachrichten</b> in diesem Chat mitlesen. Nicht nur Nachrichten an mich.<br><br>'
        }

        text +=
            '<b>Hier sind einige Dinge, die ich tun kann:</b><br><br>' +
            '<ul>' +
            '<li>📹️ Ich kann Videokonfernzen in diesem Raumn erstellen und verwalten</li>' +
            '<li>✍️ Sie können mit mir chatten wie mit einem normalen Teilnehmenden.</li>' +
            '<li>✅ Um auf alle meine Funktionen zugreifen zu können machen Sie mich bitte zu einem MODERATOR.</li>' +
            '<li>❓️ Alle weiteren Informationen erhalten sie durch tippen von "!hilfe"</li>' +
            '</ul>'

        await this.client.sendHtmlText(roomId, text)
    }
}
