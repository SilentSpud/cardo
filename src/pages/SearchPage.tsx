import { SyntheticEvent } from 'react'
import { PodcastData } from '..'
import appIcon from '../../src-tauri/icons/icon.png'

function PodcastPreview({ result }: { result: PodcastData }) {
  return (
    <div className="flex h-20 justify-between gap-4 rounded-md bg-primary-8 p-2">
      <img className="aspect-square h-full rounded-md bg-primary-7" alt="" src={result.coverUrl} onError={(e: SyntheticEvent<HTMLImageElement>) => (e.currentTarget.src = appIcon)} />

      <div className="flex flex-col text-right">
        <p>{result.podcastName}</p>
        <p>{result.artistName}</p>
      </div>
    </div>
  )
}

function SearchPage({ results }: { results: Array<PodcastData> }) {
  return (
    <div className="flex h-full w-full justify-center overflow-y-auto p-2">
      <div className="grid w-[80%] gap-1 px-2">
        {results.map((result) => {
          return <PodcastPreview result={result} />
        })}
      </div>
    </div>
  )
}

export default SearchPage
