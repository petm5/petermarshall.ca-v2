import { CID } from 'multiformats/cid'
import { multiaddr } from '@multiformats/multiaddr'
import { base64 } from "multiformats/bases/base64"
import type { PeerId } from '@libp2p/interface'
import type { IpniAnnouncement } from './ipni-announcement-sender'

interface IpniAnnouncementBuilderParams {
  advertCid: CID,
  peerId: PeerId,
  webHost: URL,
}

export const createIpniAnnouncement = (params: IpniAnnouncementBuilderParams): IpniAnnouncement => {
  const { advertCid, peerId, webHost } = params;

  console.log(`🎁 Creating IPNI announcement`)

  const protocolFragment = getProtocolFragment(webHost)

  const announceAddrs = [
    `/dns4/${webHost.host}${protocolFragment}/p2p/${peerId.toString()}`,
    `/dns6/${webHost.host}${protocolFragment}/p2p/${peerId.toString()}`
  ]

  console.log('🌐 Advertisement CID:', advertCid.toString())
  console.log('🌐 Provided by multiaddrs:', announceAddrs)

  const addrs = announceAddrs.map((a) => Buffer.from(multiaddr(a).bytes).toString('base64'))

  const payload = JSON.stringify({
    Cid: {
      '/': advertCid.toString(base64.encoder)
    },
    Addrs: addrs
  })

  console.log('\n✅ Done!')

  return {
    payload
  }
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
