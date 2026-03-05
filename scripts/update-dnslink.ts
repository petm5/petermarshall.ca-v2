import fs from 'fs/promises';
import path from 'path';
import Cloudflare from 'cloudflare'

import site from '../src/lib/site.json' with { type: 'json' };

const webHost = new URL(site.baseUrl)

console.log('🔗 Updating DNSLink Record')

const distDir = path.resolve('build')
const blocksDir = path.join(distDir, 'ipfs');

const rootCid = await fs.readFile(path.join(blocksDir, 'root'), { encoding: 'utf8' })

const recordName = `_dnslink.${webHost.hostname}`
const recordContent = `dnslink=/ipfs/${rootCid}`

const client = new Cloudflare()

const zones = await client.zones.list({
  name: webHost.hostname
})

if (zones.result.length == 0) throw new Error('Failed to find Cloudflare Zone ID')

const zone_id = zones.result[0].id

const records = await client.dns.records.list({
  zone_id,
  name: {
    exact: recordName
  }
})

if (records.result.length > 0) {
  const firstRecordId = records.result[0].id
  await client.dns.records.edit(firstRecordId, {
    zone_id,
    name: recordName,
    type: 'TXT',
    ttl: 300,
    content: recordContent
  })
} else {
  await client.dns.records.create({
    zone_id,
    name: recordName,
    type: 'TXT',
    ttl: 300,
    content: recordContent,
    comment: 'Created by IPFS build script'
  })
}

console.log('✅ Done!')
