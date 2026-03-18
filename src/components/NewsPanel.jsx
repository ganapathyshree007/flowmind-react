import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function NewsPanel() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/get-news')
        const data = await res.json()
        if (data.success) {
          setArticles(data.articles)
        }
      } catch (err) {
        console.log('News fetch failed:', err)
      }
      setLoading(false)
    }
    fetchNews()
  }, [])

  async function sendNewsToSlack() {
    setSending(true)
    try {
      const newsText = articles.slice(0, 3).map((a, i) => 
        `${i + 1}. *${a.title}*\n   ${a.source} — ${
          new Date(a.publishedAt).toLocaleDateString()
        }\n   ${a.url}`
      ).join('\n\n')

      await fetch('/api/slack-post-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'general',
          message: `🤖 *Latest AI & Tech News — FlowMind Daily Digest*\n\n${newsText}`,
          sender_name: 'FlowMind News Bot'
        })
      })
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      console.log('Send failed:', err)
    }
    setSending(false)
  }

  return (
    <div style={{
      background: '#111118',
      border: '1px solid #1e1e2e',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          color: 'white', 
          margin: 0, 
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📰 Latest AI Tech News
        </h3>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={sendNewsToSlack}
          disabled={sending || articles.length === 0}
          style={{
            background: sent 
              ? '#16a34a' 
              : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {sent 
            ? '✅ Sent to Slack!' 
            : sending 
            ? 'Sending...' 
            : '📤 Send to Slack'}
        </motion.button>
      </div>

      {loading ? (
        <div style={{ 
          color: '#9ca3af', 
          fontSize: '13px',
          textAlign: 'center',
          padding: '20px'
        }}>
          Loading latest news...
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px' 
        }}>
          {articles.map((article, i) => (
            <motion.a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                x: 4,
                borderColor: '#7C3AED' 
              }}
              style={{
                display: 'block',
                background: '#0a0a0f',
                border: '1px solid #1e1e2e',
                borderRadius: '10px',
                padding: '12px',
                textDecoration: 'none',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'white',
                lineHeight: '1.4',
                marginBottom: '4px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {article.title}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '6px'
              }}>
                <span style={{
                  fontSize: '11px',
                  background: '#1e1e2e',
                  color: '#7C3AED',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {article.source}
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  color: '#555' 
                }}>
                  {new Date(article.publishedAt)
                    .toLocaleDateString()}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  )
}
