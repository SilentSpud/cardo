import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { platform } from '@tauri-apps/plugin-os'
import { lazy, Suspense, useEffect, useState } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AudioPlayer, { AudioPlayerProvider } from './components/AudioPlayer'
import LeftMenu from './components/LeftMenu'
import SearchBar from './components/SearchBar'
import TitleBar from './components/TitleBar'
import { DBProvider } from './DB/DB'
import { SettingsProvider } from './engines/Settings'
import HomePage from './pages/HomePage'
import { SyncProvider } from './sync/Sync'
const appWindow = getCurrentWebviewWindow()
const PodcastPreview = lazy(() => import('./pages/PodcastPreview'))
const EpisodePreview = lazy(() => import('./pages/EpisodePreview'))
const Settings = lazy(() => import('./pages/Settings'))
const QueuePage = lazy(() => import('./pages/QueuePage'))
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'))

const App = () => {
  const [roundedCorners, setRoundedCorners] = useState(false)

  // handle rounded corners when window is minimized, disabled on mac
  useEffect(() => {
    if (platform() === 'macos') {
      return // no rounded corners on mac (https://github.com/agmmnn/tauri-controls/issues/10)
    } else {
      async function handleResize() {
        const isMaximized = await appWindow.isMaximized()
        setRoundedCorners(!isMaximized)
      }

      appWindow.onResized(handleResize)
      handleResize()
    }
  }, [appWindow])

  // prevent webview context menu
  useEffect(() => {
    document.addEventListener('contextmenu', (event) => event.preventDefault())

    return () => document.removeEventListener('contextmenu', (event) => event.preventDefault())
  }, [])

  return (
    <div className={`flex h-screen w-full flex-col overflow-hidden border-[1px] border-primary-7 bg-primary-9 ${roundedCorners && 'rounded-lg'}`}>
      <BrowserRouter>
        <HotkeysProvider>
          <SettingsProvider>
            <DBProvider>
              <AudioPlayerProvider>
                <SyncProvider>
                  <TitleBar />
                  <ToastContainer />
                  <div className="flex h-full w-full justify-start overflow-hidden">
                    <LeftMenu />
                    <div className="flex h-full w-full flex-col overflow-y-hidden">
                      <SearchBar />
                      <div className="flex h-full overflow-y-auto scroll-smooth border-t border-primary-8">
                        <Suspense>
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/preview" element={<PodcastPreview />} />
                            <Route path="/episode-preview" element={<EpisodePreview />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/queue" element={<QueuePage />} />
                            <Route path="/downloads" element={<DownloadsPage />} />
                          </Routes>
                        </Suspense>
                      </div>
                    </div>
                  </div>
                  <AudioPlayer className="h-28 w-full flex-shrink-0" />
                </SyncProvider>
              </AudioPlayerProvider>
            </DBProvider>
          </SettingsProvider>
        </HotkeysProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
