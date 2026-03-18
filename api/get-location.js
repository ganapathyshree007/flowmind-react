export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const forwarded = req.headers['x-forwarded-for']
    const ip = forwarded 
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || '8.8.8.8'

    const cleanIp = ip === '::1' || 
      ip === '127.0.0.1' ? '8.8.8.8' : ip

    const response = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,regionName,city,timezone,isp,query`
    )
    const data = await response.json()

    if (data.status === 'success') {
      res.status(200).json({
        success: true,
        ip: data.query,
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone,
        isp: data.isp,
        flag: `https://flagcdn.com/24x18/${data.countryCode.toLowerCase()}.png`
      })
    } else {
      res.status(200).json({
        success: false,
        error: 'Could not detect location'
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
