import login from './src/login.mjs'
import startBot from './src/bot.mjs'
import config from './src/config.mjs'
import { sleep } from './src/utils.mjs'

do {
    try {
        await login()
        await startBot()
    } catch ({ name, message }) {
        console.log('Bot crashed: %s - %s', name, message)
        await sleep(5000)
        console.log('Restarting...', name, message)
    }
} while (config.AUTO_RESTART)
