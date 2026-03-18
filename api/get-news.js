export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const NEWS_KEY = process.env.NEWS_API_KEY

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=artificial+intelligence+technology&language=en&sortBy=publishedAt&pageSize=6&apiKey=${NEWS_KEY}`
    )
    const data = await response.json()

    if (data.status === 'ok') {
      const articles = data.articles.map(a => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source.name,
        publishedAt: a.publishedAt,
        urlToImage: a.urlToImage
      }))
      res.status(200).json({ success: true, articles })
    } else {
      res.status(200).json({ 
        success: false, 
        error: data.message 
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
