// plugins/premium - reactchannel.js
let handler = async (m, { jagoanproject, args, text, usedPrefix, command }) => {

  // ========== VALIDASI ARGUMEN ==========
  if (args.length < 2) {
    return jagoanproject.sendMessage(
      m.chat,
      {
        text: `❌ *Cara Pakai:*\n${usedPrefix + command} <link_channel> <emoji1>, <emoji2>, ...\n\n*Contoh:*\n${usedPrefix + command} https://whatsapp.com/channel/0029VaKp123456 🔥, 😂, ❤️\n${usedPrefix + command} https://whatsapp.com/channel/0029VaKp123456 🔥,🤮,🤓`
      },
      { quoted: m }
    )
  }

  let link = args[0]
  let emojiInput = args.slice(1).join(' ')

  let emojis = emojiInput
    .split(',')
    .map(e => e.trim())
    .filter(e => e !== '')

  if (!link.startsWith('https://whatsapp.com/channel/')) {
    return jagoanproject.sendMessage(
      m.chat,
      { text: '❌ Link harus berupa link WhatsApp Channel yang valid!' },
      { quoted: m }
    )
  }

  if (emojis.length === 0) {
    return jagoanproject.sendMessage(
      m.chat,
      { text: '❌ Minimal 1 emoji harus diberikan! Pisahkan dengan koma.' },
      { quoted: m }
    )
  }

  // ========== STATUS ==========
  await jagoanproject.sendMessage(
    m.chat,
    { text: '⏳ Sedang mengirim react...' },
    { quoted: m }
  )

  // ========== PROSES ==========
  try {
    // 🔧 sekarang require fungsi langsung, bukan destructuring
    const reactChannel = require('../lib/reactchannel')

    const result = await reactChannel(link, emojis)

    if (result?.success) {
      await jagoanproject.sendMessage(
        m.chat,
        {
          text:
            `✅ *React Berhasil!*\n\n` +
            `🌟 Link: ${link}\n` +
            `🔥 Emoji: ${emojis.join(' ')}`
            //`📦 Response: ${result.message}`
        },
        { quoted: m }
      )
    } else {
      await jagoanproject.sendMessage(
        m.chat,
        {
          text:
            `❌ *React Gagal!*\n\n` +
            (result?.message ? `📄 Pesan: ${result.message}` : '')
        },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error('❌ Error di handler reactchannel:', e)
    await jagoanproject.sendMessage(
      m.chat,
      { text: `❌ Terjadi kesalahan:\n${e.message}` },
      { quoted: m }
    )
  }
}

handler.help = ['reactwa <link> <emoji1>, <emoji2>, ...']
handler.tags = ['tools', 'premium']
handler.command = /^(rch|reactchannel)$/i
handler.limit = 15
handler.premium = true

module.exports = handler
