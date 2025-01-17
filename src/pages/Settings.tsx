import { appConfigDir, join, resolveResource } from '@tauri-apps/api/path'
import { readDir } from '@tauri-apps/plugin-fs'
import * as shell from '@tauri-apps/plugin-shell'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TailwindBaseColor } from '..'
import appIcon from '../../src-tauri/icons/icon.png'
import tauriConfig from '../../src-tauri/tauri.conf.json'
import { Checkbox } from '../components/Inputs'
import { useModalBanner } from '../components/ModalBanner'
import { SyncSettings } from '../components/sync/SyncSettings'
import { BasicColors, DefaultTheme, DefaultThemes } from '../DefaultThemes'
import { getColor, useSettings } from '../engines/Settings'

function AccentColorSelector() {
  const [
    {
      colors: { accent },
    },
    updateSettings,
  ] = useSettings()
  const [showSelector, setShowSelector] = useState(false)

  const selectedColor = getColor(accent)
  return (
    <div className="relative">
      <button className={`h-10 w-16 rounded-md border-2 border-${selectedColor[4]}-800 bg-${selectedColor[5]}`} onClick={() => setShowSelector(true)} />

      {showSelector && (
        <div className="absolute bottom-0 left-0 z-10 grid min-w-max grid-cols-5 gap-1 rounded-md bg-primary-2 p-1">
          {BasicColors.map((color) => (
            <button
              className={`h-10 w-16 rounded-md bg-${color}-500`}
              title={color}
              key={color}
              onClick={(e) => {
                updateSettings({
                  colors: {
                    accent: color,
                  },
                })
                setShowSelector(false)
                e.preventDefault()
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Settings() {
  const { t } = useTranslation()
  const [{ globals, general, colors: colorSettings, playback, ui }, updateSettings] = useSettings()
  const [languages, setLanguages] = useState<string[]>()
  const [showBanner, Banner] = useModalBanner()

  useEffect(() => {
    const loadLocales = async () => {
      const translationsDir = await resolveResource(`_up_/resources/translations`)
      setLanguages((await readDir(translationsDir)).map((file) => file.name?.split('.')[0] ?? ''))
    }

    loadLocales()
  }, [])

  return (
    <div className="flex w-full flex-col gap-2 p-2">
      <div className="flex justify-between rounded-md border-[2px] border-primary-8 p-2">
        <h2>{t('open_settings_file')}:</h2>
        <button className="rounded-md bg-accent-7 px-2 py-1 text-sm hover:bg-accent-8" onClick={() => showBanner()}>
          config.json
        </button>

        <Banner
          labels={[t('ok'), t('cancel')]}
          onAccepted={async () => {
            const confFile = await join(await appConfigDir(), 'config.json')
            shell.open(confFile)
          }}
        >
          <h1 className="max-w-80 whitespace-pre-line p-1">{t('open_settings_danger_menu')}</h1>
        </Banner>
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">{t('sync')}</h1>
        <SyncSettings />
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">{t('general')}</h1>

        <div className="flex flex-col gap-1">
          <label className="mb-1 flex items-center gap-2 uppercase">
            {t('language')}:
            <select
              className="rounded-md bg-primary-8 px-2 py-[1px] text-center outline-none"
              onChange={({ target: { value } }) =>
                updateSettings({
                  globals: {
                    language: value as string,
                  },
                })
              }
              value={globals.language}
            >
              {languages?.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className="flex w-fit gap-1">
            {t('check_updates')}:
            <Checkbox defaultChecked={general.checkUpdates} onChange={(value) => updateSettings({ general: { checkUpdates: value } })} />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">{t('theme')}</h1>
        <div className="flex gap-10">
          <label className="flex items-center gap-2 uppercase">
            {t('base')}:
            <select
              className="rounded-md bg-primary-8 px-2 py-[1px] text-center outline-none"
              onChange={({ target: { value } }) =>
                updateSettings({
                  colors: {
                    primary: value as TailwindBaseColor | DefaultTheme,
                  },
                })
              }
              defaultValue={(colorSettings.primary as string) in DefaultThemes || BasicColors.includes(colorSettings.primary as TailwindBaseColor) ? (colorSettings.primary as string) : 'CUSTOM'}
            >
              <option value="dark">DARK</option>
              <option value="light">LIGHT</option>
              <option value="slate">SLATE</option>
            </select>
          </label>
          <label className="flex items-center gap-2 uppercase">
            {t('accent')}:
            <AccentColorSelector />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">{t('news')}</h1>

        <label className="flex w-fit gap-1">
          {t('fetch_subscriptions_startup')}:
          <Checkbox defaultChecked={general.fetchSubscriptionsAtStartup} onChange={(value) => updateSettings({ general: { fetchSubscriptionsAtStartup: value } })} />
        </label>

        <label className="flex w-full items-center gap-2">
          {t('number_days_news')}:
          <input
            type="text"
            className="w-14 rounded-md bg-primary-8 px-2 py-1 focus:outline-none"
            value={general.numberOfDaysInNews}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (!Number.isNaN(value)) {
                updateSettings({ general: { numberOfDaysInNews: value } })
              }
            }}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">{t('playback')}</h1>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end gap-2">
            <label className="flex w-fit items-center gap-2">
              {t('step_backwards')}:
              <input
                type="text"
                className="w-12 rounded-md bg-primary-8 px-2 py-1 focus:outline-none"
                value={playback.stepBackwards}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (!Number.isNaN(value)) {
                    updateSettings({ playback: { stepBackwards: value } })
                  }
                }}
              />
              <p className="-ml-1">s</p>
            </label>
            <label className="flex w-fit items-center gap-2">
              {t('step_forward')}:
              <input
                type="text"
                className="w-12 rounded-md bg-primary-8 px-2 py-1 focus:outline-none"
                value={playback.stepForward}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (!Number.isNaN(value)) {
                    updateSettings({ playback: { stepForward: value } })
                  }
                }}
              />
              <p className="-ml-1">s</p>
            </label>
          </div>

          <div className="flex flex-col items-end gap-2">
            <label className="flex w-fit gap-1">
              {t('remove_from_queue_end')}:
              <Checkbox defaultChecked={playback.removeFromQueueAtEnd} onChange={(value) => updateSettings({ playback: { removeFromQueueAtEnd: value } })} />
            </label>
            <label className="flex w-fit gap-1">
              {t('remove_from_downloads_end')}:
              <Checkbox defaultChecked={playback.removeFromDownloadsAtEnd} onChange={(value) => updateSettings({ playback: { removeFromDownloadsAtEnd: value } })} />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">UI</h1>
        <div>
          <label className="flex w-fit gap-1">
            {t('show_pinWindow_button')}:
            <Checkbox defaultChecked={ui.showPinWindowButton} onChange={(value) => updateSettings({ ui: { showPinWindowButton: value } })} />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-md border-[2px] border-primary-8 p-2">
        <h1 className="mb-2 border-b-2 border-primary-8 uppercase">{t('about')}</h1>
        <div className="flex gap-2">
          <img alt="" className="w-36 cursor-pointer transition-all hover:p-2" title={t('open_web')} src={appIcon} onClick={() => shell.open('https://cardo-podcast.github.io')} />
          <div className="flex flex-col justify-between">
            <h1 className="UPPERCASE">
              Cardo - {t('podcast_player')} (v{tauriConfig.version})
            </h1>
            <h1>{t('author')}: n0vella</h1>
            <div className="flex h-fit items-center gap-1">
              <p>{t('source_code')}: </p>
              <img className="w-5 cursor-pointer rounded-full bg-white p-[1px]" src="https://github.githubassets.com/favicons/favicon.png" alt="Github" title="https://github.com/cardo-podcast/cardo" onClick={() => shell.open('https://github.com/cardo-podcast/cardo')} />
            </div>
            <div className="flex h-12 items-center gap-2">
              <a href="https://www.buymeacoffee.com/n0vella" target="_blank" rel="noreferrer">
                <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" className="h-12" />
              </a>
              <a href="https://www.paypal.com/paypalme/adriannovella" target="_blank" rel="noreferrer">
                <img src="https://www.paypalobjects.com/webstatic/icon/pp196.png" alt="Paypal" className="h-12 rounded-md" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
