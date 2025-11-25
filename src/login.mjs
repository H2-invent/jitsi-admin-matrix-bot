import { MatrixAuth } from 'matrix-bot-sdk'
import config from './config.mjs'

export default async function login() {
    const auth = new MatrixAuth(config.MATRIX_URL)
    const client = await auth.passwordLogin(config.MATRIX_USERNAME, config.MATRIX_PASSWORD)

    console.log('New access token generated')
    config.MATRIX_TOKEN = client.accessToken
}
