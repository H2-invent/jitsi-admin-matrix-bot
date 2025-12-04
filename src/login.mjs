import { MatrixAuth } from 'matrix-bot-sdk'
import { clearCrypto } from './storage.mjs'
import config from './config.mjs'

export default async function login() {
    // always clear crypto before issuing new token so it doesn't try decrypting with old token keys
    await clearCrypto()

    const auth = new MatrixAuth(config.MATRIX_URL)
    const client = await auth.passwordLogin(config.MATRIX_USERNAME, config.MATRIX_PASSWORD)

    console.log('New access token generated')
    config.MATRIX_TOKEN = client.accessToken
}
