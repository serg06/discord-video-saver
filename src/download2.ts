import 'lodash.product';
import {getPythonPath, initPythonPath} from './python-path';
import {spawnAsync} from './spawn-util';
import {getTempFileName} from './tmpfilenames';

const DLSCRIPT_PATH = `${__dirname}/public/python/download_clip.py`;
const ONE_MB = 1024 * 1024;

enum DiscordServerLevels {
    NONE = 0,
    TIER_1 = 1,
    TIER_2 = 2,
    TIER_3 = 3
}

export function getMaxClipSize(server_level: number) {
    return server_level < DiscordServerLevels.TIER_2 ? 7.5 * ONE_MB : 49.5 * ONE_MB;
}

/**
 * Startup cleanup/etc.
 */
export async function initDownloader() {
    await initPythonPath();
}

async function downloadClipCommand(url: string, max_clip_size: number) {
    const filepath = getTempFileName('.mp4');
    await spawnAsync(getPythonPath(), [
        DLSCRIPT_PATH,
        '--url',
        url,
        '--max-size',
        `${max_clip_size}`,
        '--output-path',
        filepath
    ]);
    return filepath;
}

export async function downloadClip(url: string, max_clip_size: number) {
    return await downloadClipCommand(url, max_clip_size);
}
