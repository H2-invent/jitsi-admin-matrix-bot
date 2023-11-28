import {AutojoinRoomsMixin, MatrixClient, RustSdkCryptoStorageProvider, SimpleFsStorageProvider} from "matrix-bot-sdk";

import {MATRIX_DISPLAYNAME, MATRIX_TOKEN, MATRIX_URL} from './config.mjs'
import {conferenceUtils} from './confernceUtils.mjs'
const cryptoProvider = new RustSdkCryptoStorageProvider("./crypto-storage/");

// LogService.muteModule("Metrics");
// LogService.trace = LogService.debug;
// LogService.setLevel(LogLevel.TRACE);
// This will be the URL where clients can reach your homeserver. Note that this might be different
// from where the web/chat interface is hosted. The server must support password registration without
// captcha or terms of service (public servers typically won't work).
const homeserverUrl = MATRIX_URL;


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
client.setDisplayName(MATRIX_DISPLAYNAME)
const conferenceUtil = new conferenceUtils(client);
// This is the command handler we registered a few lines up
async function handleCommand(roomId, event) {
    // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
    if (event['content']?.['msgtype'] !== 'm.text') return;
    if (event['sender'] === await client.getUserId()) return;

    // Check to ensure that the `!hello` command is being run
    const body = event['content']['body'];
    if (body?.startsWith("!jitsi")){
        await conferenceUtil.sendMessageWithUrl(roomId);
        await conferenceUtil.changeRoomName(roomId);
    }
    if (body?.startsWith("!join")){
        await conferenceUtil.sendJoinConference(roomId);
    }
    if (body?.startsWith("!hilfe")){
        conferenceUtil.sendHelp(roomId)
    }
}
