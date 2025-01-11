import { createContext, useContext } from 'react'
import { AudioPlayerRef } from '.'
import { DB } from './DB'
import { SyncContextType } from './sync'

export const SyncContext = createContext<SyncContextType | null>(null)
export const useSync = () => useContext(SyncContext) as SyncContextType

export const DBContext = createContext<DB | undefined>(undefined)
export const useDB = () => useContext(DBContext) as DB

export const PlayerContext = createContext<AudioPlayerRef | undefined>(undefined)
export const usePlayer = () => useContext(PlayerContext) as AudioPlayerRef
