export default {
    AUTO_RESTART: process.env.AUTO_RESTART || true,
    BOT_VERSION: process.env.BOT_VERSION || '<version-addhere>',
    JITSI_ADMIN_URL: process.env.JITSI_ADMIN_URL || 'https://jitsi-admin.de',
    MATRIX_DISPLAYNAME: process.env.MATRIX_DISPLAYNAME || 'Raumassistent',
    MATRIX_PASSWORD: process.env.MATRIX_PASSWORD,
    MATRIX_TOKEN: undefined,
    // This will be the URL where clients can reach your homeserver. Note that this might be different
    // from where the web/chat interface is hosted. The server must support password registration without
    // captcha or terms of service (public servers typically won't work).
    MATRIX_URL: process.env.MATRIX_URL || 'https://matrix.org',
    MATRIX_USERNAME: process.env.MATRIX_USERNAME,
    SHOW_WARNING_OF_MIM: process.env.SHOW_WARNING_OF_MIM || false,
    STORAGE_BOT_FILE: process.env.STORAGE_BOT_FILE || './storage/bot.json',
    STORAGE_CRYPTO_DIR: process.env.STORAGE_CRYPTO_DIR || './storage/crypto/',
}
