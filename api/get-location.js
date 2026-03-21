export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const forwarded = req.headers['x-forwarded-for']
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || ''

    const cleanIp = ip === '::1' || 
      ip === '127.0.0.1' || 
      ip === '' ? '' : ip

    const token = process.env.IPINFO_TOKEN
    const url = cleanIp
      ? `https://ipinfo.io/${cleanIp}/json?token=${token}`
      : `https://ipinfo.io/json?token=${token}`

    const response = await fetch(url)
    const data = await response.json()

    const parts = (data.org || '').split(' ')
    const ispName = parts.slice(1).join(' ')
      .replace(/\s+Ltd\.?/i, '')
      .replace(/\s+Limited/i, '')
      .replace(/\s+Pvt\.?/i, '')
      .replace(/\s+AS\s+for.*/i, '')
      .replace(/\s+GPRS.*/i, '')
      .trim()

    res.status(200).json({
      success: true,
      ip: data.ip,
      city: data.city || 'Unknown',
      region: data.region || '',
      country: data.country || '',
      countryCode: data.country?.toLowerCase() || '',
      timezone: data.timezone || '',
      isp: ispName,
      flag: data.country
        ? `https://flagcdn.com/24x18/${data.country.toLowerCase()}.png`
        : ''
    })
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    })
  }
}
