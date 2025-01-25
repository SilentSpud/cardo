import * as http from '@tauri-apps/plugin-http'
import { GpodderUpdate, ProtocolFn, ServerGpodderUpdate, SubscriptionsUpdate } from '.'

export async function login(url: string, user: string, password: string): Promise<boolean> {
  // just eturns true if login was successful
  const loginUrl = new URL(url)
  loginUrl.pathname = `api/2/auth/${user}/login.json`

  const req = await http.fetch(loginUrl.href, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(user + ':' + password),
    },
  })

  return req.ok
}

export const gpodderProtocol: ProtocolFn = function (creds) {
  async function pullEpisodes(since?: number) {
    const { server, user, password } = creds

    const url = new URL(server)
    url.pathname = `api/2/episodes/${user}.json`

    if (since !== undefined) {
      url.searchParams.set('since', since.toString())
    }

    url.searchParams.set('aggregated', 'true')

    const req = await http.fetch(url.href, {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + btoa(user + ':' + password),
        'Content-Type': 'application/json',
      },
    })

    const reqData = JSON.parse(await req.text()) as { actions: ServerGpodderUpdate[] }

    return reqData.actions.map((update: ServerGpodderUpdate) => ({
      ...update,
      timestamp: new Date(update.timestamp).getTime(), //timestamp in epoch format (server is in utc ISO format)
    }))
  }

  async function pullSubscriptions(since?: number) {
    const { server, user, password } = creds

    const url = new URL(server)
    url.pathname = `api/2/subscriptions/${user}/all.json`

    if (since !== undefined) {
      url.searchParams.set('since', since.toString())
    }

    const req = await http.fetch(url.href, {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + btoa(user + ':' + password),
        'Content-Type': 'application/json',
      },
    })

    const reqData = JSON.parse(await req.text()) as SubscriptionsUpdate

    return reqData
  }

  async function pushEpisodes(updates: GpodderUpdate[]) {
    const { server, user, password } = creds

    const url = new URL(server)
    url.pathname = `api/2/episodes/${user}.json`

    const req = await http.fetch(url.href, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(user + ':' + password),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        updates.map((update) => ({
          ...update,
          timestamp: new Date(update.timestamp).toISOString(),
        })),
      ),
    })

    if (!req.ok) {
      throw Error('Failed pushing episodes to gpodder server')
    }
  }

  async function pushSubscriptions(updates: SubscriptionsUpdate) {
    const { server, user, password } = creds

    const url = new URL(server)
    url.pathname = `api/2/subscriptions/${user}/cardo.json`

    const req = await http.fetch(url.href, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(user + ':' + password),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!req.ok) {
      throw Error('Failed pushing subscriptions to gpodder server')
    }
  }

  return { login, pullEpisodes, pullSubscriptions, pushEpisodes, pushSubscriptions }
}
