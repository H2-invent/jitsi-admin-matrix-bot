import { AutojoinRoomsMixin, MatrixClient, RustSdkCryptoStorageProvider, SimpleFsStorageProvider } from 'matrix-bot-sdk'
import config from './config.mjs'
import conferenceUtils from './conferenceUtils.mjs'

let client
let conferenceUtil

export default async function startBot() {
    const storageProvider = new SimpleFsStorageProvider(config.STORAGE_BOT_FILE)
    const cryptoProvider = new RustSdkCryptoStorageProvider(config.STORAGE_CRYPTO_DIR)

    client = new MatrixClient(config.MATRIX_URL, config.MATRIX_TOKEN, storageProvider, cryptoProvider)
    AutojoinRoomsMixin.setupOnClient(client)
    client.on('room.message', handleCommand)
    client.on('room.join', handleMembership)

    try {
        await client.start()
        console.log('Bot started!')
    } catch (error) {
        throw new Error('Token invalid')
    }

    client.setDisplayName(config.MATRIX_DISPLAYNAME)
    client
        .getWhoAmI()
        .then((userInfo) => {
            console.log('Logged in as User:', userInfo.user_id)
            console.log('Logged in with the device ID:', userInfo.device_id)
        })
        .catch((err) => {
            console.error('Error verifying session:', err)
        })

    conferenceUtil = new conferenceUtils(client)

    // Keep the bot running indefinitely
    return new Promise(() => {})
}

async function handleCommand(roomId, event) {
    // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
    if (event['content']?.['msgtype'] !== 'm.text') return
    if (event['sender'] === (await client.getUserId())) return

    // check body for commands to execute
    const body = event['content']['body']?.toLowerCase()
    if (body?.startsWith('!jitsi')) {
        await conferenceUtil.sendMessageWithUrl(roomId)
        await conferenceUtil.changeRoomName(roomId)
    }

    if (body?.startsWith('!join')) {
        await conferenceUtil.sendJoinConference(roomId)
    }

    if (body?.startsWith('!hilfe')) {
        await conferenceUtil.sendHelp(roomId)
    }
    if (body?.startsWith('!starten')) {
        await conferenceUtil.inviteAll(roomId)
    }
    if (body?.startsWith('!version')) {
        await conferenceUtil.sendVersion(roomId)
    }
}

async function handleMembership(roomId, event) {
    await conferenceUtil.sendWelcome(roomId)
}
