import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { PodcastData } from '../..'

export async function SearchApple(term: string): Promise<Array<PodcastData>> {
  const url = `https://itunes.apple.com/search?limit=40&entity=podcast&term=${term.trim().replace(' ', '+')}`

  const response = await tauriFetch(url) // fetching from backend to avoid cors errors
  const apiResults = await response.json()

  const results = []
  for (const result of apiResults) {
    if (result.feedUrl) {
      results.push({
        podcastName: result.collectionName,
        artistName: result.artistName,
        coverUrl: result.artworkUrl100,
        coverUrlLarge: result.artworkUrl600,
        feedUrl: result.feedUrl,
      })
    }
  }

  return results
}
