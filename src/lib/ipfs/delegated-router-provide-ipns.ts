import { base36 } from 'multiformats/bases/base36'
import type { CID } from 'multiformats/cid'

interface ipnsProvideParams {
  ipnsData: ArrayBuffer,
  ipnsName: CID,
  delegatedRouterHost: URL,
}

export const provideIpnsRecord = async (params: ipnsProvideParams) => {
  const { ipnsData, ipnsName, delegatedRouterHost } = params;

  console.log(`\n🎁 Providing IPNS advertisement`)

  const ipnsNameString = ipnsName.toV1().toString(base36)

  console.log('🌐 IPNS name:', ipnsNameString)

  const ipnsResponse = await fetch(`${delegatedRouterHost.protocol}//${delegatedRouterHost.host}/routing/v1/ipns/${ipnsNameString}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/vnd.ipfs.ipns-record'
    },
    body: ipnsData
  })

  if (ipnsResponse.status != 200) {
    return console.warn('\n❌ Got error:', ipnsResponse.status, await ipnsResponse.text())
  }

  console.log('\n✅ Done!')
}
