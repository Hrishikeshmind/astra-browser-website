export const GITHUB_REPO = 'Hrishikeshmind/astradesktop'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'astra-browser-website',
}

export type GitHubReleaseAsset = {
  name: string
  size: number
  download_count: number
}

export type GitHubRelease = {
  tag_name: string
  published_at: string
  assets: GitHubReleaseAsset[]
}

async function fetchGitHub<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: githubHeaders })
  if (!res.ok) {
    throw new Error(`GitHub API request failed (${res.status}): ${url}`)
  }
  return res.json() as Promise<T>
}

let cachedLatestRelease: Promise<GitHubRelease> | null = null
let cachedAllReleases: Promise<GitHubRelease[]> | null = null
let cachedTotalDownloadCount: Promise<number> | null = null

/** Latest non-draft release from GitHub Releases API. */
export function getLatestRelease(): Promise<GitHubRelease> {
  if (!cachedLatestRelease) {
    cachedLatestRelease = fetchGitHub<GitHubRelease>(`${GITHUB_API}/releases/latest`)
  }
  return cachedLatestRelease
}

/** All published releases (paginated). Cached once per build. */
export function getAllReleases(): Promise<GitHubRelease[]> {
  if (!cachedAllReleases) {
    cachedAllReleases = (async () => {
      const releases: GitHubRelease[] = []
      let page = 1

      while (true) {
        const batch = await fetchGitHub<GitHubRelease[]>(
          `${GITHUB_API}/releases?per_page=100&page=${page}`
        )
        if (batch.length === 0) break
        releases.push(...batch)
        if (batch.length < 100) break
        page += 1
      }

      return releases
    })()
  }
  return cachedAllReleases
}

/** Sum download_count across every asset on every release. Cached once per build. */
export function getTotalDownloadCount(): Promise<number> {
  if (!cachedTotalDownloadCount) {
    cachedTotalDownloadCount = getAllReleases()
      .then(releases =>
        releases.reduce(
          (total, release) =>
            total + release.assets.reduce((sum, asset) => sum + asset.download_count, 0),
          0
        )
      )
      .catch(error => {
        cachedTotalDownloadCount = null
        throw error
      })
  }
  return cachedTotalDownloadCount
}

export function formatDownloadCount(count: number): string {
  return `${count.toLocaleString('en-US')} downloads`
}

/** Strip a leading "v" from a GitHub release tag (e.g. "v1.21.4b" → "1.21.4b"). */
export function formatReleaseVersion(tagName: string): string {
  return tagName.startsWith('v') ? tagName.slice(1) : tagName
}

/** Format asset size in bytes as a human-readable string (e.g. "68 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) {
    return `${Math.round(bytes / 1_048_576)} MB`
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${bytes} B`
}

export function getAssetSize(assets: GitHubReleaseAsset[], filename: string): number | null {
  const asset = assets.find(a => a.name.toLowerCase() === filename.toLowerCase())
  return asset?.size ?? null
}
