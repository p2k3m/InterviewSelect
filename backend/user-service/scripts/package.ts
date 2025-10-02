import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
import archiver from 'archiver';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const handlersDir = path.join(projectRoot, 'src', 'handlers');
const distDir = path.join(projectRoot, 'dist');
const distHandlersDir = path.join(distDir, 'handlers');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function zipFile(input: string, output: string, entryName: string) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = await fs.open(output, 'w');
  const writeStream = stream.createWriteStream();

  archive.file(input, { name: `${entryName}.mjs` });
  archive.finalize().catch((error) => {
    throw error;
  });
  await pipeline(archive, writeStream);
  await stream.close();
}

async function buildHandlers() {
  const handlerFiles = (await fs.readdir(handlersDir)).filter((file) => file.endsWith('.ts'));
  await ensureDir(distHandlersDir);

  for (const file of handlerFiles) {
    const handlerName = file.replace('.ts', '');
    const entryPoint = path.join(handlersDir, file);
    const outfile = path.join(distHandlersDir, `${handlerName}.mjs`);
    const zipPath = path.join(distDir, `${handlerName}.zip`);

    await esbuild.build({
      entryPoints: [entryPoint],
      outfile,
      format: 'esm',
      platform: 'node',
      target: 'node20',
      bundle: true,
      sourcemap: false,
      external: ['aws-sdk'],
    });

    await zipFile(outfile, zipPath, handlerName);
    console.log(`Packaged ${handlerName} -> ${zipPath}`);
  }
}

buildHandlers().catch((error) => {
  console.error(error);
  process.exit(1);
});
