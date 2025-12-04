// lib/reactchannel.js
const fetch = require('node-fetch') // kalau butuh

async function reactChannel(link, emojis) {
  // Validasi sederhana biar gak buang request percuma
  if (!link || !Array.isArray(emojis) || emojis.length === 0) {
    return {
      success: false,
      status: 400,
      message: 'Link atau emoji tidak valid'
    }
  }

  const bearers = [
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MmY2MWQ3MjZlYmZkNDE1MzczY2RiMyIsImlhdCI6MTc2NDcxMjk2MCwiZXhwIjoxNzY1MzE3NzYwfQ.qtqbQ_-31X7f4XeXVPgNwt7FKeVxgc59Bmf34pXCkEI"
  ]

  const tokek = Math.floor(Math.random() * bearers.length)

  try {
    const res = await fetch('https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post', {
      method: 'POST',
      headers: {
        'authority': 'foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'authorization': bearers[tokek],
        'origin': 'https://asitha.top',
        'referer': 'https://asitha.top/',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      },
      body: JSON.stringify({
        post_link: link,
        reacts: emojis
      })
    })

    const resultText = await res.text()
    console.log(`✅ React sukses ke ${link}\n🌟 Emoji: ${emojis}\n📦 Response: ${resultText}`)

    return {
      success: res.ok,
      status: res.status,
      message: resultText
    }
  } catch (err) {
    console.error('❌ Error saat request reactChannel:', err)
    return {
      success: false,
      status: 500,
      message: err.message || 'Terjadi kesalahan saat menghubungi server'
    }
  }
}

// 👉 export sebagai fungsi langsung
module.exports = reactChannel
