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

    const countryCode = data.country?.toLowerCase() || ''

    res.status(200).json({
      success: true,
      ip: data.ip,
      city: data.city || 'Unknown',
      region: data.region || '',
      country: data.country || '',
      countryName: data.country || '',
      timezone: data.timezone || '',
      isp: data.org || '',
      flag: countryCode
        ? `https://flagcdn.com/24x18/${countryCode}.png`
        : ''
    })
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    })
  }
}
