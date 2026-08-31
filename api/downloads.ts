import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_REPO = 'Hrishikeshmind/astradesktop'
const COUNT_KEY = 'site-download-count'
const INSTALLER_ASSET_PATTERN = /\.(exe|AppImage|dmg|tar\.xz|zip)$/i

type GitHubAsset = { name: string; download_count: number }
type GitHubRelease = { assets: GitHubAsset[] }

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function isInstallerAsset(filename: string): boolean {
  return INSTALLER_ASSET_PATTERN.test(filename)
}

async function fetchGitHubInstallerDownloadCount(): Promise<number> {
  let page = 1
  let total = 0

  while (true) {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'astra-browser-website',
        },
      }
    )

    if (!res.ok) {
      throw new Error(`GitHub API failed (${res.status})`)
    }

    const releases = (await res.json()) as GitHubRelease[]
    if (!Array.isArray(releases) || releases.length === 0) break

    for (const release of releases) {
      for (const asset of release.assets ?? []) {
        if (isInstallerAsset(asset.name)) {
          total += asset.download_count ?? 0
        }
      }
    }

    if (releases.length < 100) break
    page += 1
  }

  return total
}

async function resolveCount(redis: Redis, increment = false): Promise<number> {
  const [storedRaw, githubCount] = await Promise.all([
    redis.get<number>(COUNT_KEY),
    fetchGitHubInstallerDownloadCount().catch(() => null),
  ])

  const stored = typeof storedRaw === 'number' ? storedRaw : 0
  const baseline = githubCount != null ? Math.max(stored, githubCount) : stored
  const next = increment ? baseline + 1 : baseline

  if (next !== stored) {
    await redis.set(COUNT_KEY, next)
  }

  return next
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  const redis = getRedis()
  if (!redis) {
    if (req.method === 'GET') {
      try {
        const count = await fetchGitHubInstallerDownloadCount()
        return res.status(200).json({ count, source: 'github' })
      } catch {
        return res.status(200).json({ count: 0, source: 'fallback' })
      }
    }

    return res.status(503).json({
      error: 'Download counter storage is not configured. Add Upstash Redis in Vercel.',
    })
  }

  try {
    if (req.method === 'GET') {
      const count = await resolveCount(redis, false)
      return res.status(200).json({ count, source: 'redis' })
    }

    if (req.method === 'POST') {
      const count = await resolveCount(redis, true)
      return res.status(200).json({ count, source: 'redis' })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch {
    return res.status(500).json({ error: 'Failed to update download counter' })
  }
}
