import {md5} from "js-md5";
import {BOT_VERSION, JITSI_ADMIN_URL, SHOW_WARNING_OF_MIM} from "./config.mjs";
import gitRepoInfo from 'git-repo-info';

export class conferenceUtils {
    client;

    constructor(client) {
        this.client = client;
    }

    async createConference(roomId) {
        var roomDescription = await this.getRoomTopic(roomId)
            const escapedBaseUrl = JITSI_ADMIN_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedBaseUrl + '[^\\s\\n]+');
            const match = roomDescription.match(regex);
            if (match) {
                return match[0];
            }

        var hash = md5(roomId);
        return JITSI_ADMIN_URL + '/m/' + hash;
    }

    async sendMessageWithUrl(roomId) {
        var url = await this.createConference(roomId);
        await this.client.sendText(roomId, 'Die Konferenz für diesen Raum läuft unter dieser URL: ' + url);
    }

    async sendJoinConference(roomId) {
        var url = await this.createConference(roomId);
        await this.client.sendHtmlText(roomId, '<a href ="' + url + '">Hier der Konferenz beitreten</a> ');
    }

    async inviteAll(roomId) {
        var url = await this.createConference(roomId);
        var text = '@room <h2>Diese Konferenz startet gerade</h2><br><a href="'+url+'">➡️Jetzt dieser Konfernz beitreten</a>'
        await this.client.sendHtmlText(roomId, text);
    }

    async changeRoomName(roomId) {
        var roomDescription = await this.getRoomTopic(roomId)

        var conferenceUrl = await this.createConference(roomId);
        if (!roomDescription.includes(conferenceUrl)) {
            try {
                await this.client.sendStateEvent(roomId, 'm.room.topic', '', {'topic': roomDescription + "\n\r" + conferenceUrl})
            }catch (e) {
                await this.client.sendText(roomId, 'Der Bot benötigt die Berechtigung "Moderator" um das Raumthema ändern zu dürfen.');
            }

        }
    }

    async sendHelp(roomId) {
        await this.client.sendText(
            roomId,
            'Neue Konferenz erstellen: !jitsi\n\r' +
            'Direkt der Konferenz beitreten: !join\n\r' +
            'Konferenz für alle starten: !starten\n\r'+
            'Diese Hilfeseite anzeigen: !hilfe\n\r'
        );
    }
    async getRoomTopic(roomId){
        var roomDescription = '';
        try {
            roomDescription = await this.client.getRoomStateEvent(roomId, 'm.room.topic');
            roomDescription = roomDescription.topic;
        }catch (e) {
        }
        return roomDescription;
    }

    async getVersion(roomId) {
        const repoInfo = gitRepoInfo();

        this.client.sendText(roomId, 'Version: '+BOT_VERSION);
    }
    async sendWelcome(roomId) {
        var text= '<h2>Hallo, ich bin der Raumassistent.</h2><br> Ein Teammitglied hat mich in diesen Raum eingeladen.<br><br>';

        if (SHOW_WARNING_OF_MIM){
            text += '⚠️ Kleiner Disclaimer zu Beginn: Ich kann <b>alle Nachrichten</b> in diesem Chat mitlesen. Nicht nur Nachrichten an mich.<br>'
        }

        text +='<b>Hier sind einige Dinge, die ich tun kann:</b>' +
            '<ul>'+
            '<li>📹️ Ich kann Videokonfernzen in diesem Raumn erstellen und verwalten</li>'
            '<li>✍️ Sie können mit mir chatten wie mit einem normalen Teilnehmenden.</li>' +
        '<li>✅ Um auf alle meine Funktionen zugreifen zu können machen Sie mich bitte zu einem MODERATOR.</li>' +
        '<li>❓️ Alle weiteren Informationen erhalten sie durch tippen von "!hilfe"</li>'
        +'</ul>';


        this.client.sendHtmlText(roomId, text);
    }
}

