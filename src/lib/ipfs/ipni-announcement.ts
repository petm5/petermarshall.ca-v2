import { CID } from 'multiformats/cid'
import { multiaddr } from '@multiformats/multiaddr'
import { base64 } from "multiformats/bases/base64"
import type { PeerId } from '@libp2p/interface'

interface ipniAnnouncementParams {
  advertCid: CID,
  peerId: PeerId,
  webHost: URL,
  indexerHost: URL
}

export const announceIpni = async (params: ipniAnnouncementParams) => {
  const { advertCid, peerId, webHost, indexerHost } = params;

  console.log(`🎁 Announcing IPNI advertisement`)

  const protocolFragment = getProtocolFragment(webHost)

  const announceAddrs = [
    `/dns4/${webHost.host}${protocolFragment}/p2p/${peerId.toString()}`,
    `/dns6/${webHost.host}${protocolFragment}/p2p/${peerId.toString()}`
  ]

  console.log('🌐 Advertisement CID:', advertCid.toString())
  console.log('🌐 Announcing multiaddrs:', announceAddrs)

  const addrs = announceAddrs.map((a) => Buffer.from(multiaddr(a).bytes).toString('base64'))

  const payload = JSON.stringify({
    Cid: {
      '/': advertCid.toString(base64.encoder)
    },
    Addrs: addrs
  })

  const response = await fetch(`${indexerHost.protocol}//${indexerHost.host}/announce`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: payload
  })

  if (response.status != 204) {
    return console.warn('\n❌ Got error:', response.status, await response.text())
  }

  console.log('\n✅ Done!')
}

const getProtocolFragment = (host: URL): string => {
  switch (host.protocol) {
    case 'http:':
      return `/tcp/${host.port || '80'}/http`
    case 'https:':
      return `/tcp/${host.port || '443'}/https`
    default:
      throw new Error(`Unknown multiaddr protocol: ${host.protocol}`)
  }
}
