import { md5 } from 'js-md5'
import { MatrixClient } from 'matrix-bot-sdk'
import config from './config.mjs'
import { hrtime } from 'node:process'

export default class conferenceUtils {
    /** @type MatrixClient */
    #client
    #topicRegex = new RegExp(/^(?<description>.*?)\nMeetling: (?<url>.*?)$/s)
    #oldTopicRegex = new RegExp(/^(?<description>.*?)\n\r?(?<url>https?:.*)$/s)

    constructor(client) {
        this.#client = client
    }

    async sendMeetling(roomId) {
        const url = this.#createNewConferenceUrl(roomId)
        await this.#pinUrlToTopic(roomId, url)
        await this.#sendMeetlingMessage(roomId, url)
    }

    async sendJoin(roomId) {
        const url = await this.#getUrlFromTopic(roomId)
        await this.#sendJoinMessage(roomId, url)
    }

    async sendSofortkonferenz(roomId) {
        const url = this.#createNewConferenceUrl(roomId)
        await this.#sendSofortKonferenzMessage(roomId, url)
    }

    async sendHilfe(roomId) {
        await this.#sendHelpMessage(roomId)
    }

    async sendEinladen(roomId) {
        const url = await this.#getUrlFromTopicOrCreate(roomId)
        await this.#sendInvitationMessage(roomId, url)
    }

    async sendVersion(roomId) {
        await this.#sendVersion(roomId)
    }

    async sendIAmBack() {
        await this.#sendIAmBackToAllJoinedRooms()
    }

    async sendWelcome(roomId) {
        await this.#sendWelcome(roomId)
    }

    async #sendMeetlingMessage(roomId, url) {
        await this.#client.sendText(roomId, `Die Konferenz für diesen Raum läuft unter dieser URL:\n${url}`)
    }

    async #sendJoinMessage(roomId, url) {
        if (!url) {
            await this.#client.sendText(
                roomId,
                'Keine offene Konferenz gefunden. Erstellen Sie eine Neue mit "!meetling"'
            )
        }
        await this.#client.sendHtmlText(roomId, `<a href ="${url}">Hier der Konferenz beitreten</a>`)
    }

    async #sendHelpMessage(roomId) {
        await this.#client.sendText(
            roomId,
            'Neue Raum-Konferenz erstellen:\t!meetling\n' +
                'Direkt der Konferenz beitreten:\t!join\n' +
                'Neue Sofortkonferenz erstellen:\t!sofort\n' +
                'Raum in Konferenz einladen:\t\t!einladen\n' +
                'Bot Versionsnummer anzeigen:\t!version\n' +
                'Diese Hilfe anzeigen:\t\t\t!hilfe'
        )
    }

    async #sendSofortKonferenzMessage(roomId, url) {
        await this.#client.sendHtmlText(roomId, `<a href="${url}">Hier der Sofortkonferenz beitreten</a>`)
    }

    async #sendInvitationMessage(roomId, url) {
        await this.#client.sendHtmlText(
            roomId,
            `@room <h2>Diese Konferenz startet gerade</h2>
            <br>
            <a href="${url}">➡️ Jetzt dieser Konferenz beitreten</a>`
        )
    }

    async #sendVersion(roomId) {
        await this.#client.sendText(roomId, 'Version: ' + config.BOT_VERSION)
    }

    async #sendWelcome(roomId) {
        let text = `<h2>Hallo, ich bin der Raumassistent.</h2>
            <br>
            Ein Teammitglied hat mich in diesen Raum eingeladen.
            <br><br>`

        if (config.SHOW_WARNING_OF_MIM) {
            text +=
                '⚠️ Kleiner Disclaimer zu Beginn: Ich kann <b>alle Nachrichten</b> in diesem Chat mitlesen. Nicht nur Nachrichten an mich.<br><br>'
        }

        text += `<b>Hier sind einige Dinge, die ich tun kann:</b>
            <br><br>
            <ul>
                <li>📹️ Ich kann Videokonfernzen in diesem Raumn erstellen und verwalten</li>
                <li>✅ Um auf alle meine Funktionen zugreifen zu können machen Sie mich bitte zu einem MODERATOR.</li>
                <li>❓️ Alle weiteren Informationen erhalten Sie durch tippen von "!hilfe"</li>
            </ul>`

        await this.#client.sendHtmlText(roomId, text)
    }

    async #sendIAmBack(roomId) {
        await this.#client.sendHtmlText(
            roomId,
            `<h2>🎉 Ich bin wieder zurück! 🥳</h2>
            ❗ Nach kurzer Schaffenspause bin ich wieder mit gewohnten und neuen Funktionen online.
            <br>
            ❓ Informationen zu meinen Funktionen erhalten Sie durch tippen von "!hilfe"
            `
        )
    }

    #createNewConferenceUrl(roomId) {
        const hash = md5(roomId + hrtime.bigint())
        return `${config.JITSI_ADMIN_URL}/m/${hash}`
    }

    async #getUrlFromTopicOrCreate(roomId) {
        const url = await this.#getUrlFromTopic(roomId)
        if (url) {
            return url
        }
        return this.#createNewConferenceUrl(roomId)
    }

    async #getRoomTopic(roomId) {
        let roomDescription = ''
        try {
            roomDescription = await this.#client.getRoomStateEvent(roomId, 'm.room.topic')
            roomDescription = roomDescription.topic
        } catch (e) {}
        return roomDescription
    }

    async #sendIAmBackToAllJoinedRooms() {
        const joinedRooms = await this.#client.getJoinedRooms()
        for (const roomId of joinedRooms) {
            if (await this.#client.userHasPowerLevelFor(this.#client.getUserId(), roomId, 'm.room.message', false)) {
                // even though we check for the correct powerLevel, sometimes it will still throw M_FORBIDDEN, but let's disregard that for now
                try {
                    await this.#sendIAmBack(roomId)
                } catch (e) {}
            }
        }
    }

    async #pinUrlToTopic(roomId, url) {
        const topic = await this.#getRoomTopic(roomId)
        const topicMatches = topic.match(this.#topicRegex)
        const oldTopicMatches = topic.match(this.#oldTopicRegex)

        let newTopic
        if (topic === '') {
            newTopic = `Meetling: ${url}`
        } else if (topicMatches) {
            newTopic = `${topicMatches.groups.description}\nMeetling: ${url}`
        } else if (oldTopicMatches) {
            newTopic = `${oldTopicMatches.groups.description}\nMeetling: ${url}`
        } else {
            newTopic = `${topic}\nMeetling: ${url}`
        }

        try {
            await this.#client.sendStateEvent(roomId, 'm.room.topic', '', {
                topic: newTopic,
            })
        } catch (e) {
            await this.#client.sendText(
                roomId,
                'Der Bot benötigt die Berechtigung "Moderator" um das Raumthema ändern zu dürfen.'
            )
        }
    }

    async #getUrlFromTopic(roomId) {
        const topic = await this.#getRoomTopic(roomId)
        const topicMatches = topic.match(this.#topicRegex)

        return topicMatches?.groups?.url
    }
}
