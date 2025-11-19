import fs from 'node:fs'
import config from './config.mjs'

export default function clearStorage() {
    // ignore errors since it's most probably that they don't exist and that's fine
    try {
        fs.rmSync(config.STORAGE_CRYPTO_DIR, { recursive: true, force: true })
    } catch (e) {}
    try {
        fs.rmSync(config.STORAGE_BOT_FILE, { recursive: true, force: true })
    } catch (e) {}
}
