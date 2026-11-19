// Build main and copy it into the website repo under lodge-lexicon/.
// The orchestrator then commits and pushes the website repo.
// Usage: npm run publish:site   (SITE_DIR overrides the website repo path)
import { execSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', ...opts }).trim();

const branch = run('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') throw new Error(`Publish only from main (on "${branch}").`);
if (run('git status --porcelain')) throw new Error('Working tree is not clean. Commit or stash first.');

const siteDir = resolve(process.env.SITE_DIR ?? '../lachlanheadley852.github.io');
if (!existsSync(resolve(siteDir, '.git'))) throw new Error(`No website repo at ${siteDir}`);
const target = resolve(siteDir, 'lodge-lexicon');

execSync('npm run build', { stdio: 'inherit' });
rmSync(target, { recursive: true, force: true });
cpSync('dist', target, { recursive: true });

console.log(`Copied build of main@${run('git rev-parse --short HEAD')} to ${target}`);
