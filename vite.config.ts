import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, build, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function runNode(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`node ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function prerenderPlugin(): Plugin {
  let isSsrBuild = false;
  let outDir = path.join(rootDir, 'dist');

  return {
    name: 'smara-prerender',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
      outDir = config.build.outDir;
    },
    async closeBundle() {
      if (isSsrBuild || process.env.SMARA_SSR_BUILD === '1') return;

      const serverDir = path.join(rootDir, '.ssr-build');
      process.env.SMARA_SSR_BUILD = '1';
      try {
        await build({
          root: rootDir,
          configFile: path.join(rootDir, 'vite.config.ts'),
          publicDir: false,
          logLevel: 'info',
          build: {
            ssr: path.join(rootDir, 'src/entry-server.tsx'),
            outDir: serverDir,
            emptyOutDir: true,
            copyPublicDir: false,
          },
        });
        await runNode([
          path.join(rootDir, 'scripts/prerender.mjs'),
          outDir,
          path.join(serverDir, 'entry-server.js'),
        ]);
        fs.rmSync(serverDir, { recursive: true, force: true });
      } finally {
        delete process.env.SMARA_SSR_BUILD;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), prerenderPlugin()],
  publicDir: isSsrBuild ? false : 'public',
  build: {
    copyPublicDir: !isSsrBuild,
  },
}));
