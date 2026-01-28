import { createLibp2p } from 'libp2p'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { ping } from '@libp2p/ping'
import { identify } from '@libp2p/identify'
import { bootstrap } from '@libp2p/bootstrap'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { CID } from 'multiformats/cid'
import { multiaddr } from '@multiformats/multiaddr'
import type { Multiaddr } from '@multiformats/multiaddr'
import path from 'node:path';
import { glob } from 'glob';
import site from '../src/lib/site.json' with { type: 'json' };

const bootstrapList = [
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt"
]

const webHost = new URL(site.baseUrl).host

const distDir = path.resolve('build')
const blocksDir = path.join(distDir, 'ipfs');

console.log('🧬 Publishing provider records in the Amino DHT')

let announceAddrs: Array<Multiaddr> = []
const node = await createLibp2p({
  services: {
    aminoDHT: kadDHT({
      protocol: '/ipfs/kad/1.0.0',
      clientMode: true,
      peerInfoMapper: removePrivateAddressesMapper
    }),
    ping: ping(),
    identify: identify()
  },
  transports: [tcp()],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  peerDiscovery: [
    bootstrap({
      list: bootstrapList
    })
  ],
  connectionManager: {
    maxConnections: 100,
    dialTimeout: 10000
  },
  addresses: {
    announceFilter: () => {
      return announceAddrs
    }
  }
})

const peerId = node.peerId.toString()

announceAddrs.push(multiaddr(`/dns4/${webHost}/tcp/443/https/p2p/${peerId}`))
announceAddrs.push(multiaddr(`/dns6/${webHost}/tcp/443/https/p2p/${peerId}`))

console.log(`🔑 Instantiated libp2p with PeerID: ${peerId}`)

// node.addEventListener('peer:discovery', (evt) => {
//   console.log('👋 Found peer:', evt.detail.id.toString())
// })

// node.addEventListener('peer:connect', (evt) => {
//   console.log('🔌 Connected to peer:', evt.detail.toString())
// })

// node.addEventListener('peer:reconnect-failure', (evt) => {
//   console.log('❌ Peer connection failed:', evt.detail.toString())
// })

// setInterval(() => {
//   const connections = node.getConnections()
//   console.log(`🌐 Connected to ${connections.length} peers`)
// }, 5000)

await node.start()

export const publish = async () => {
  const paths = await glob('**', {
    cwd: blocksDir,
    nodir: true
  })

  const cids = paths.filter((p) => p != 'root').map((p) => p.toString())

  console.log(`🚀 Providing ${cids.length} CIDs from ${blocksDir.toString()}...`);

  for (const cid of cids) {
    console.log(`📁 Providing CID: ${cid}`)
    await node.contentRouting.provide(CID.parse(cid))
  }
}

const stop = async () => {
  await node.stop()
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

publish().catch(console.error).then(stop)
