import fs from 'fs/promises'
import path from 'node:path'
import { CID } from 'multiformats/cid'
import { peerIdFromString } from '@libp2p/peer-id'

import { announceIpni } from '../src/lib/ipfs/ipni-announcement'
import { provideIpnsRecord } from '../src/lib/ipfs/delegated-router-provide-ipns'

import site from '../src/lib/site.json' with { type: 'json' };

const webHost = new URL(site.baseUrl)

const distDir = path.resolve('build')
const advertDir = path.join(distDir, 'ipni', 'v1', 'ad')

const indexerHost = new URL('https://cid.contact')
const delegatedRouterHost = new URL('https://delegated-ipfs.dev')

const advertCid = CID.parse(await fs.readFile(path.join(advertDir, 'head'), { encoding: 'utf8' }))
const peerId = peerIdFromString(await fs.readFile(path.join(advertDir, 'id'), { encoding: 'utf8' }))

const ipnsData = (await fs.readFile(path.join(advertDir, 'ipns'))).buffer

await announceIpni({ advertCid, peerId, webHost, indexerHost }).catch(console.error)

await provideIpnsRecord({ ipnsData, ipnsName: peerId.toCID(), delegatedRouterHost })
