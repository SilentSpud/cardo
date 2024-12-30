import {} from '@tauri-apps/api'
import { GpodderUpdate, ProtocolFn, ServerGpodderUpdate, SubscriptionsUpdate } from '.'
import * as http from '@tauri-apps/plugin-http'
import * as shell from '@tauri-apps/plugin-shell'
import { parse, stringify } from 'lossless-json'

export async function login(url: string, onSucess: (user: string, password: string) => void) {
  // nextcloud flow v2 o-auth login
  // https://docs.nextcloud.com/server/latest/developer_manual/client_apis/LoginFlow/index.html#login-flow-v2

  const baseUrl = url.split('index.php')[0] // clean possible extra paths in url, cannot guess subpaths without index.php

  const req = await http.fetch(baseUrl + '/index.php/login/v2', {
    method: 'POST',
  })

  const reqData = parse(await req.text()) as { login: string; poll: { token: string; endpoint: string } }

  shell.open(reqData.login) // throw explorer with nextcloud login page

  // start polling for a sucessful response of nextcloud
  const interval = setInterval(async () => {
    const pollRequest = await http.fetch(reqData.poll.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: stringify({
        token: reqData.poll.token,
      }),
    })

    if (!pollRequest.ok) return // poll again

    const pollData = parse(await pollRequest.text()) as { server: string; loginName: string; appPassword: string }

    onSucess(pollData.loginName, pollData.appPassword)
    clearInterval(interval)
  }, 1000)
  return interval
}

export const nextcloudProtocol: ProtocolFn = function (creds) {
  async function pullEpisodes(since?: number) {
    const { server, user, password } = creds

    const url = server + `/index.php/apps/gpoddersync/episode_action?since=${since === undefined ? '0' : since?.toString()}`

    const req = await http.fetch(url, {
      method: 'GET',
      headers: {
        'OCS-APIRequest': 'true',
        Authorization: 'Basic ' + btoa(user + ':' + password),
      },
    })

    const reqData = parse(await req.text()) as { actions: ServerGpodderUpdate[] }

    return reqData.actions.map((update) => ({
      ...update,
      timestamp: new Date(update.timestamp + '+00:00').getTime(), //timestamp in epoch format (server is in utc ISO format)
    }))
  }

  async function pullSubscriptions(since?: number) {
    const { server, user, password } = creds

    const url = server + `/index.php/apps/gpoddersync/subscriptions?since=${since === undefined ? '0' : since?.toString()}`

    const req = await http.fetch(url, {
      method: 'GET',
      headers: {
        'OCS-APIRequest': 'true',
        Authorization: 'Basic ' + btoa(user + ':' + password),
      },
    })

    const reqData = parse(await req.text()) as SubscriptionsUpdate

    return reqData
  }

  async function pushEpisodes(updates: GpodderUpdate[]) {
    const { server, user, password } = creds

    const url = server + `/index.php/apps/gpoddersync/episode_action/create`

    const req = await http.fetch(url, {
      method: 'POST',
      headers: {
        'OCS-APIRequest': 'true',
        Authorization: 'Basic ' + btoa(user + ':' + password),
        'Content-Type': 'application/json',
      },
      body: stringify(
        updates.map((update) => ({
          ...update,
          timestamp: new Date(update.timestamp).toISOString().split('.')[0],
        })),
      ),
    })

    if (!req.ok) {
      throw Error('Failed pushing episodes to nextcloud server')
    }
  }

  async function pushSubscriptions(updates: SubscriptionsUpdate) {
    const { server, user, password } = creds

    const url = server + `/index.php/apps/gpoddersync/subscription_change/create`

    const req = await http.fetch(url, {
      method: 'POST',
      headers: {
        'OCS-APIRequest': 'true',
        Authorization: 'Basic ' + btoa(user + ':' + password),
        'Content-Type': 'application/json',
      },
      body: stringify(updates),
    })

    if (!req.ok) {
      throw Error('Failed pushing subcriptions to nextcloud server')
    }
  }

  return { login, pullEpisodes, pullSubscriptions, pushEpisodes, pushSubscriptions }
}
