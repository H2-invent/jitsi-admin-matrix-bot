import fs from 'node:fs'
import config from './config.mjs'

export function clearCrypto() {
    if (fs.existsSync(config.STORAGE_CRYPTO_DIR)) {
        fs.rmSync(config.STORAGE_CRYPTO_DIR, { recursive: true, force: true })
        console.log("Cleared crypto")
    }
}

export function clearStorage() {
    if (fs.existsSync(config.STORAGE_BOT_FILE)) {
        fs.rmSync(config.STORAGE_BOT_FILE, { recursive: true, force: true })
        console.log("Cleared storage")
    }
}
