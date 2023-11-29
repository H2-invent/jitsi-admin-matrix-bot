import {md5} from "js-md5";
import {JITSI_ADMIN_URL} from "./config.mjs";

export class conferenceUtils {
    client;

    constructor(client) {
        this.client = client;
    }

    async createConference(roomId) {
        try {
            var roomDescription = await this.client.getRoomStateEvent(roomId, 'm.room.topic');
            console.log(roomDescription);
            roomDescription = roomDescription.topic;
            const escapedBaseUrl = JITSI_ADMIN_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const regex = new RegExp(escapedBaseUrl + '[^\\s\\n]+');
            const match = roomDescription.match(regex);
            if (match) {
                return match[0];
            }
        }catch (e) {
            console.log('The Room description was empty');
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
        await this.client.sendHtmlText(roomId, '<div role="button" tabindex="0" class="mx_AccessibleButton mx_MemberList_invite"><a href ="' + url + '">Hier der Konferenz beitreten</a></div> ');
    }

    async changeRoomName(roomId) {
        var roomDescription ='';
        try {
            roomDescription = await this.client.getRoomStateEvent(roomId, 'm.room.topic');
            roomDescription = roomDescription.topic;
        }catch (e) {

        }
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
            'Diese Hilfeseite anzeigen: !hilfe\n\r'
        );
    }
}

