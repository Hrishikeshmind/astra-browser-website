import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const COUNT_KEY = 'site-download-count'

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  const redis = getRedis()

  if (req.method === 'GET') {
    if (!redis) {
      return res.status(200).json({ count: 0 })
    }

    try {
      const count = (await redis.get<number>(COUNT_KEY)) ?? 0
      return res.status(200).json({ count })
    } catch {
      return res.status(200).json({ count: 0 })
    }
  }

  if (req.method === 'POST') {
    if (!redis) {
      return res.status(503).json({ error: 'Download counter storage is not configured' })
    }

    try {
      const count = await redis.incr(COUNT_KEY)
      return res.status(200).json({ count })
    } catch {
      return res.status(503).json({ error: 'Download counter storage is not configured' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
