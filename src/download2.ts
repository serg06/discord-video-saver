import {promisify} from "util";
import {exec} from "child_process";
import * as fs from "fs";
import {spawnAsync} from "./spawn-util";

const awaitableExec = promisify(exec);
import randomstring from 'randomstring';
import 'lodash.product';
import _ from 'lodash';
import {lookpath} from "lookpath";
import {getTempFileName} from "./tmpfilenames";

const DLSCRIPT_PATH = `${__dirname}/public/python/download_clip.py`;
const ONE_MB = 1024 * 1024;
const MAX_CLIP_SIZE = 7.5 * ONE_MB;

let pythonPath;


async function initPythonPath() {
    const paths = (await Promise.all(['python', 'python3'].map(cmd => lookpath(cmd)))).filter(Boolean);

    if (paths.length === 0) {
        throw Error('Cannot find suitable python executable!');
    }

    pythonPath = paths[0];
}

/**
 * Startup cleanup/etc.
 */
export async function initDownloader() {
    // Set python path
    await initPythonPath();
}

async function downloadClipCommand(url: string) {
    const filepath = getTempFileName('.mp4');
    await spawnAsync(pythonPath, [
        DLSCRIPT_PATH,
        '--url',
        url,
        '--max-size',
        `${MAX_CLIP_SIZE}`,
        '--output-path',
        filepath
    ]);
    return filepath;
}

export async function downloadClip(url: string) {
    return await downloadClipCommand(url);
}
