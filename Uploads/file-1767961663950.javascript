////////////////////////////
/* 🚀 Jagoan Project - Buat Bot Makin Keren! 🚀
📢 Jangan lupa *Subscribe* & *Like* semua video kami!
💬 Butuh panel untuk *Run WhatsApp Bot*? Hubungi: *0895-3622-82300*
🛒 Jual *Script Bot WhatsApp* hanya *70K* - Free Update! 🔥
✨ Dapatkan bot WhatsApp canggih & selalu up-to-date!  
*/
////////////////////////////
/* 🚀 Jagoan Project - Changelog Firestore (REST + MIX Buttons) 🚀 */
////////////////////////////
const axios = require('axios')
const { getDevice } = require('@whiskeysockets/baileys')

/* ================= FIREBASE INIT (CONFIG) ================= */
const firebaseConfig = {
  apiKey: "AIzaSyBdpT9cCJ7LxaRD2V9xveqr1uq0axbMzaY",
  authDomain: "rating-9ae8a.firebaseapp.com",
  projectId: "rating-9ae8a",
  storageBucket: "rating-9ae8a.firebasestorage.app",
  messagingSenderId: "564880172184",
  appId: "1:564880172184:web:6c2cb71428cd6552e61ced"
}

const COLLECTION = 'changelogs'
const PER_PAGE = 5

// ================= UTIL =================
function normalizeType(raw) {
  const t = String(raw || '').toLowerCase().trim().replace(/[\s_-]+/g, '')
  if (['feature', 'newfeature', 'newfitur', 'fitur', 'fiturbaru'].includes(t)) return 'feature'
  if (['fix', 'bugfix', 'hotfix'].includes(t)) return 'fix'
  return 'update'
}

function typeEmoji(type) {
  if (type === 'feature') return '🆕'
  if (type === 'fix') return '🛠'
  return '🔄'
}
function typeLabel(type) {
  if (type === 'feature') return 'New Feature'
  if (type === 'fix') return 'Fix'
  return 'Update'
}

function relativeTime(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} detik lalu`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} hari lalu`
  const w = Math.floor(d / 7)
  if (w < 52) return `${w} minggu lalu`
  const y = Math.floor(d / 365)
  return `${y} tahun lalu`
}

function formatID(date) {
  const tgl = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const jam = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
  return `${tgl} • ${jam}`
}

function isSameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function parseFirestoreDoc(doc) {
  const f = doc.fields || {}
  const title = f.title?.stringValue || ''
  const description = f.description?.stringValue || ''
  const typeRaw = f.type?.stringValue || 'update'
  const ts = f.date?.timestampValue || f.date?.stringValue || null
  const date = ts ? new Date(ts) : null
  if (!date || isNaN(date.getTime())) return null

  return {
    title: String(title).trim(),
    description: String(description).trim(),
    type: normalizeType(typeRaw),
    date
  }
}

async function fetchChangelog({ pageSize = 200 } = {}) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}` +
    `/databases/(default)/documents/${COLLECTION}`

  const params = {
    key: firebaseConfig.apiKey,
    pageSize,
    orderBy: 'date desc'
  }

  const res = await axios.get(url, { params, timeout: 45000 })
  const docs = res.data.documents || []
  return docs.map(parseFirestoreDoc).filter(Boolean)
}

function parseArgs(text) {
  // .changelog
  // .changelog 2
  // .changelog feature
  // .changelog 2 feature
  // .changelog today
  const raw = String(text || '').trim().toLowerCase()
  if (!raw) return { page: 1, type: 'all', today: false }

  let page = 1
  let type = 'all'
  let today = false

  for (const tok of raw.split(/\s+/)) {
    if (/^\d+$/.test(tok)) page = Math.max(1, parseInt(tok))
    else if (['all', 'update', 'feature', 'fix'].includes(tok)) type = tok
    else if (tok === 'today' || tok === 'hariini' || tok === 'hari-ini') today = true
  }
  return { page, type, today }
}

/** ✅ Revisi: single_select hanya 5 opsi */
function buildFilterSelect(usedPrefix, command) {
  const mk = (title, desc, id) => ({ title, description: desc, id })
  const cmd = usedPrefix + command

  return {
    title: 'Filter Changelog',
    sections: [{
      title: 'Pilih Filter',
      rows: [
        mk('Semua', 'Tampilkan semua changelog', `${cmd} 1 all`),
        mk('Update', 'Hanya tipe update', `${cmd} 1 update`),
        mk('New Feature', 'Hanya fitur baru', `${cmd} 1 feature`),
        mk('Fix', 'Hanya perbaikan', `${cmd} 1 fix`),
        mk('Hari ini', 'Changelog hari ini (semua tipe)', `${cmd} 1 all today`)
      ]
    }]
  }
}

/** ✅ Revisi: nomor item lanjut, bukan reset */
function buildText({ itemsPage, page, totalPages, total, todayTicker, type, today }) {
  const filterLabel = today ? `${type.toUpperCase()} + TODAY` : type.toUpperCase()
  const startNumber = (page - 1) * PER_PAGE // untuk numbering global

  let out = `*📌 CHANGELOG TRACKER*\n`
  out += `*Update hari ini:* ${todayTicker || 'Belum ada Update'}\n\n`
  out += `*Halaman:* ${page}/${totalPages} (Total: ${total})\n`
  out += `*Filter:* ${filterLabel}\n\n`

  itemsPage.forEach((x, i) => {
    const no = startNumber + i + 1
    out += `*${no}. ${typeEmoji(x.type)} ${typeLabel(x.type)}*  _(${relativeTime(x.date)})_\n`
    out += `Tanggal :  ${formatID(x.date)}\n`
    out += `Judul : *${x.title || '-'}*\n`
    out += `Deskripsi : ${x.description || '-'}\n\n`
  })

  return out.trim()
}

// ================= HANDLER =================
let handler = async (m, { jagoanproject, text, usedPrefix, command }) => {
  try {
    await jagoanproject.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const device = await getDevice(m.key.id)
    const { page, type, today } = parseArgs(text)

    let itemsAll = await fetchChangelog({ pageSize: 250 })

    // ticker "update hari ini" dari SEMUA data
    const now = new Date()
    const allToday = itemsAll.filter(x => isSameLocalDay(x.date, now))
    const todayTicker = allToday.length
      ? allToday.map(x => x.title).filter(Boolean).join(' / ')
      : 'Belum ada Update'

    // apply filter ke items
    let items = itemsAll
    if (type !== 'all') items = items.filter(x => x.type === type)
    if (today) items = items.filter(x => isSameLocalDay(x.date, now))

    if (!items.length) {
      await jagoanproject.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return m.reply('Tidak ada changelog untuk filter tersebut.')
    }

    const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE))
    const p = Math.min(Math.max(1, page), totalPages)
    const itemsPage = items.slice((p - 1) * PER_PAGE, (p - 1) * PER_PAGE + PER_PAGE)

    const msgText = buildText({
      itemsPage,
      page: p,
      totalPages,
      total: items.length,
      todayTicker,
      type,
      today
    })

    // next/prev tetap membawa filter yang sama
    const baseArgs = `${type}${today ? ' today' : ''}`.trim()
    const prevCmd = `${usedPrefix + command} ${Math.max(1, p - 1)} ${baseArgs}`.trim()
    const nextCmd = `${usedPrefix + command} ${Math.min(totalPages, p + 1)} ${baseArgs}`.trim()

    const listMessage = buildFilterSelect(usedPrefix || '.', command || 'changelog')

    // iOS fallback (ikut pola menu mix)
    if (device === 'ios') {
      let footer = `\n\nKetik *${usedPrefix || '.'}${command} ${p + 1} ${baseArgs}* untuk next\n`
      footer += `Filter: *${usedPrefix || '.'}${command} update|feature|fix* | Hari ini: *${usedPrefix || '.'}${command} today*`
      await jagoanproject.sendMessage(m.chat, { text: msgText + footer }, { quoted: m })
      await jagoanproject.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return
    }

    // MIX Buttons: Prev, Next, + single_select
    const sent = await jagoanproject.sendMessage(m.chat, {
      text: msgText,
      footer: `Navigasi & Filter`,
      buttons: [
        { buttonId: prevCmd, buttonText: { displayText: '⬅️ Prev' }, type: 1 },
        { buttonId: nextCmd, buttonText: { displayText: '➡️ Next' }, type: 1 },
        {
          buttonId: 'action',
          buttonText: { displayText: 'Filter Changelog' },
          type: 4,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify(listMessage)
          }
        }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m })

    await jagoanproject.sendMessage(m.chat, { react: { text: '✅', key: sent.key } })
  } catch (e) {
    console.error('Changelog error:', e?.response?.data || e)
    await jagoanproject.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`🚫 Error: ${e?.response?.data?.error?.message || e.message || e}`)
  }
}

handler.help = ['changelog [page] [update|feature|fix|all] [today]']
handler.tags = ['internet']
handler.command = ['changelog', 'clog', 'logupdate']
handler.register = true
handler.limit = true

module.exports = handler
