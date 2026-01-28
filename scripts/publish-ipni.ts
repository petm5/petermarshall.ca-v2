import path from 'node:path'
import { glob } from 'glob'
import { CID } from 'multiformats/cid'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import { BlockView } from 'multiformats'
import * as dagJson from '@ipld/dag-json'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'

import { Provider, Advertisement } from '@web3-storage/ipni'
import { EntryChunk, RECOMMENDED_MAX_BLOCK_BYTES } from '@web3-storage/ipni/entry-chunk.js'

import site from '../src/lib/site.json' with { type: 'json' }

const webHost = new URL(site.baseUrl).host

const distDir = path.resolve('build')
const blocksDir = path.join(distDir, 'ipfs')

const peerId = await createEd25519PeerId()

export const generate = async () => {
  const paths = await glob('**', {
    cwd: blocksDir,
    nodir: true,
    ignore: ['root', 'bafkqaaa']
  })

  const cids: Array<CID> = paths.map((p) => CID.parse(p.toString()))

  console.log(`📦 Preparing IPNI advertisement for ${cids.length} CIDs...`)

  const context = new Uint8Array([99])
  const previous = null

  const http4 = new Provider({
    protocol: 'http',
    addresses: `/dns4/${webHost}/tcp/443/https`,
    peerId
  })

  const http6 = new Provider({
    protocol: 'http',
    addresses: `/dns6/${webHost}/tcp/443/https`,
    peerId
  })

  let entryChunk = new EntryChunk()
  for (const cid of cids) {
    entryChunk.add(cid.multihash.bytes)
    if (entryChunk.calculateEncodedSize() >= RECOMMENDED_MAX_BLOCK_BYTES) {
      const block = await entryChunk.export()
      await writeBlock(block)
      entryChunk = new EntryChunk({ next: block.cid })
    }
  }

  const entryBlock = await entryChunk.export()
  await writeBlock(entryBlock)

  const advert = new Advertisement({
    providers: [http4, http6],
    entries: entryBlock.cid,
    context,
    previous
  })

  const value = await advert.encodeAndSign()

  const block = await Block.encode({ value, codec: dagJson, hasher: sha256 })

  await writeBlock(block)

  console.log(`\n✅ Done!`);
  console.log(`🌐 Advertisement CID: ${rootCid}`);
}

export const writeBlock = async (block: BlockView) => {
  let { cid, bytes } = block
  await fs.writeFile(block.cid.toString(), block.bytes)
}

generate().catch(console.error)
