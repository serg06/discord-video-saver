import fs from "fs";
import randomstring from 'randomstring';

const OUTPUT_DIR = `${__dirname}/tmp`;

export function getTempFileName(suffix?: string) {
    return `${OUTPUT_DIR}/${randomstring.generate()}-${suffix || ''}`;
}

export async function initTmpFilenamesService() {
    // Remove old folders
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, {recursive: true});
    }

    // Create new folder
    fs.mkdirSync(OUTPUT_DIR);
}
