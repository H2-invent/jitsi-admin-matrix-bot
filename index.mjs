

import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin,
    LogService,
    LogLevel,
    RustSdkCryptoStorageProvider
} from "matrix-bot-sdk";
import { md5 } from 'js-md5';

import {JITSI_ADMIN_URL, MATRIX_TOKEN, MATRIX_URL} from './config.mjs'

const cryptoProvider = new RustSdkCryptoStorageProvider("./crypto-storage/");

// LogService.muteModule("Metrics");
// LogService.trace = LogService.debug;
// LogService.setLevel(LogLevel.TRACE);
// This will be the URL where clients can reach your homeserver. Note that this might be different
// from where the web/chat interface is hosted. The server must support password registration without
// captcha or terms of service (public servers typically won't work).
const homeserverUrl = MATRIX_URL;
const jitsiAdminServerUrl = JITSI_ADMIN_URL;

// Use the access token you got from login or registration above.
const accessToken = MATRIX_TOKEN;//"syt_aDJpbnZlbnRib3Q_NCOyzAPnpzQoyfACReZX_09Heja";

// In order to make sure the bot doesn't lose its state between restarts, we'll give it a place to cache
// any information it needs to. You can implement your own storage provider if you like, but a JSON file
// will work fine for this example.
const storage = new SimpleFsStorageProvider("./crypto-storage/bot.json");

// Finally, let's create the client and set it to autojoin rooms. Autojoining is typical of bots to ensure
// they can be easily added to any room.
const client = new MatrixClient(homeserverUrl, accessToken, storage, cryptoProvider);
AutojoinRoomsMixin.setupOnClient(client);

// Before we start the bot, register our command handler
client.on("room.message", handleCommand);

// Now that everything is set up, start the bot. This will start the sync loop and run until killed.
client.start().then(() => console.log("Bot started!"));

// This is the command handler we registered a few lines up
async function handleCommand(roomId, event) {
    // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
    if (event['content']?.['msgtype'] !== 'm.text') return;
    if (event['sender'] === await client.getUserId()) return;

    // Check to ensure that the `!hello` command is being run
    const body = event['content']['body'];
    if (!body?.startsWith("!jitsi")) return;
    // Now that we've passed all the checks, we can actually act upon the command
   await sendMessageWithUrl(client,roomId);
   await changeRoomName(client, roomId);
}

function createConference(roomId) {
    var hash = md5(roomId);
    return jitsiAdminServerUrl+'/m/'+hash;
}

async function sendMessageWithUrl(client,roomId) {
    await client.sendText(roomId, 'Die Konferenz für diesen Raum läuft unter dieser URL: '+createConference(roomId));
}

async function changeRoomName(client, roomId){
    var roomDescription =   await client.getRoomStateEvent(roomId,'m.room.topic');
    roomDescription = roomDescription.topic;
    var conferenceUrl = createConference(roomId);
    if (!roomDescription.includes(conferenceUrl)){
        await client.sendStateEvent(roomId,'m.room.topic','',{'topic':roomDescription+"\n\r"+conferenceUrl})
    }
}