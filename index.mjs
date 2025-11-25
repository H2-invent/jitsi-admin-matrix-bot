import clearStorage from './src/storage.mjs'
import login from './src/login.mjs'
import startBot from './src/bot.mjs'
import config from './src/config.mjs'

do {
    try {
        // when bots restarts it re-reads all messages inside the channel and re-executes all commands.
        // if we generate new encryption keys every time the old messages can't be decrypted and thus, will not be re-executed
        await clearStorage()
        await login()
        await startBot()
    } catch ({name, message}) {
        console.log('Bot crashed: %s - %s', name, message)
        await sleep(5000)
        console.log('Restarting...', name, message)
    }
} while (config.AUTO_RESTART)

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
