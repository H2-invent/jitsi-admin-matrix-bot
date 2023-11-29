import {md5} from "js-md5";
import {JITSI_ADMIN_URL} from "./config.mjs";
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
        await this.client.sendHtmlText(roomId, '<div role="button" tabindex="0" class="mx_AccessibleButton mx_MemberList_invite"><a href ="' + url + '">Hier der Konferenz beitreten</a></div> ');
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

        this.client.sendText(roomId, 'Version: '+repoInfo.tag);
    }

}

