import { importer } from 'ipfs-unixfs-importer';
import { rabin } from 'ipfs-unixfs-importer/chunker';
import { BlackHoleBlockstore } from 'blockstore-core';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

class RawDirBlockstore extends BlackHoleBlockstore {
  constructor(blocksDir) {
    super()
    this.blocksDir = blocksDir
  }
  async put(cid, data) {
    const filename = cid.toString()
    await fs.writeFile(path.join(this.blocksDir, filename), data);
    return super.put(cid, data)
  }
}

const generate = async () => {
  const distDir = path.resolve('build')
  const blocksDir = path.join(distDir, 'ipfs');
  const blockstore = new RawDirBlockstore(blocksDir);

  console.log('📦 Generating IPFS block store')

  await fs.mkdir(blocksDir, { recursive: true });

  const paths = await glob('**/*', {
    cwd: distDir,
    nodir: true,
    ignore: ['ipfs/**']
  });

  const source = await Promise.all(paths.map(async (p) => ({
    path: p,
    content: await fs.readFile(path.join(distDir, p))
  })));

  console.log(`🚀 Processing ${source.length} files from ${blocksDir.toString()}...`);

  const options = {
    chunker: rabin({
      minChunkSize: 8192,
      avgChunkSize: 16384,
      maxChunkSize: 32768,
    }),
    rawLeaves: true
  };

  let rootCid;
  for await (const entry of importer(source, blockstore, options)) {
    rootCid = entry.cid;
  }

  await fs.writeFile(path.join(blocksDir, 'root'), rootCid.toString())

  // Empty probing CID
  await fs.writeFile(path.join(blocksDir, 'bafkqaaa'), '')

  console.log(`\n✅ Done!`);
  console.log(`🌐 Root CID: ${rootCid}`);
}

generate().catch(console.error)
