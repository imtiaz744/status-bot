const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ logger: P({ level: 'silent' }), printQRInTerminal: true, auth: state, browser: ["StatusBot", "Chrome", "1.0"] })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot()
    } else if (connection === 'open') {
      console.log('Bot Connected! Status auto view ON')
    }
  })
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key.remoteJid === 'status@broadcast') {
        await sock.readMessages([msg.key])
        console.log('Viewed status from:', msg.pushName)
      }
    }
  })
}
startBot()
