import { resolveResource } from '@tauri-apps/api/path'
import { readTextFile } from '@tauri-apps/plugin-fs'
import i18n from 'i18next'
import { parse } from 'lossless-json'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
})

export async function changeLanguage(lang: string) {
  const translationsFile = await resolveResource(`_up_/resources/translations/${lang}.json`) // why _up_ ?

  i18n.addResourceBundle(lang, 'translation', parse(await readTextFile(translationsFile)))

  i18n.changeLanguage(lang)
}
