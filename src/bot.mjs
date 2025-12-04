import {
    MatrixClient,
    RustSdkCryptoStorageProvider,
    SimpleFsStorageProvider,
} from 'matrix-bot-sdk'
import config from './config.mjs'
import conferenceUtils from './conferenceUtils.mjs'
import net from 'node:net'
import fs from 'node:fs'

let client
let conferenceUtil

export default async function startBot() {
    const storageProvider = new SimpleFsStorageProvider(config.STORAGE_BOT_FILE)
    const cryptoProvider = new RustSdkCryptoStorageProvider(config.STORAGE_CRYPTO_DIR)

    client = new MatrixClient(config.MATRIX_URL, config.MATRIX_TOKEN, storageProvider, cryptoProvider)
    client.on('room.message', handleCommand)
    client.on('room.join', handleMembership)
    client.on('room.invite', handleInvite);

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

    // set up unix domain socket as another way to get commands
    const socketPath = '/run/jitsi-admin-matrix-bot/command.sock'
    // remove stale socket on boot
    if (fs.existsSync(socketPath)) {
        fs.unlinkSync(socketPath);
    }
    net.createServer(socket => {
        socket.on('data', handleSocketCommand)
    }).listen(socketPath)

    // Keep the bot running indefinitely
    return new Promise(() => {})
}

async function handleCommand(roomId, event) {
    // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
    if (event['content']?.['msgtype'] !== 'm.text') return
    if (event['sender'] === (await client.getUserId())) return

    // check body for commands to execute
    const body = event['content']['body']?.toLowerCase()
    if (body?.startsWith('!meetling')) {
        await conferenceUtil.sendMeetling(roomId)
    }
    if (body?.startsWith('!join')) {
        await conferenceUtil.sendJoin(roomId)
    }
    if (body?.startsWith('!sofort')) {
        await conferenceUtil.sendSofortkonferenz(roomId)
    }
    if (body?.startsWith('!einladen')) {
        await conferenceUtil.sendEinladen(roomId)
    }
    if (body?.startsWith('!version')) {
        await conferenceUtil.sendVersion(roomId)
    }
    if (body?.startsWith('!hilfe')) {
        await conferenceUtil.sendHilfe(roomId)
    }
}

async function handleSocketCommand(data) {
    const command = data.toString().trim()
    switch (command) {
        case 'i-am-back':
            await conferenceUtil.sendIAmBack()
            break
    }
}

async function handleMembership(roomId, event) {
    await conferenceUtil.sendWelcome(roomId)
}

async function handleInvite (roomId, event) {
    try {
        await client.joinRoom(roomId)
    } catch (e) {
        console.log("Could not join room! Here's the event:")
        console.log(event)
    }
}
