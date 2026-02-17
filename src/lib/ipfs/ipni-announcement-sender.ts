export interface IpniAnnouncement {
  payload: string
}

export const sendIpniAnnouncement = async (announcement: IpniAnnouncement, indexerHost: URL) => {
  const { payload } = announcement

  const announceUrl = `${indexerHost.protocol}//${indexerHost.host}/announce`

  console.log(`📡 Sending IPNI announcement`)
  console.log('🌐 Announce URL:', announceUrl)

  const response = await fetch(announceUrl, {
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
