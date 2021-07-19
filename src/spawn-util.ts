import {spawn, SpawnOptions} from "child_process";

export interface SpawnResult {
    stdout: string,
    stderr: string,
    code: number
}

function createSpawnResult(chunks: Buffer[], errorChunks: Buffer[], code: number, error?: string): SpawnResult {
    return {
        stdout: Buffer.concat(chunks).toString(),
        stderr: `${Buffer.concat(errorChunks).toString()} | ${error}`,
        code: code,
    }
}

// TODO: Recreate this to use streamlink directly?
export async function spawnAsync(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions) {
    return new Promise<SpawnResult>((resolve, reject) => {
        const spawnProcess = spawn(command, args || [], options || {});
        const chunks: Buffer[] = [];
        const errorChunks: Buffer[] = [];

        spawnProcess.stdout.on("data", (data) => {
            console.log('Encountered stdout');

            process.stdout.write(data.toString());
            chunks.push(data);
        });

        spawnProcess.stderr.on("data", (data) => {
            console.log('Encountered stderr');

            process.stderr.write(data.toString());
            errorChunks.push(data);
        });

        spawnProcess.on("error", (error: string) => {
            console.log('Encountered error');
            reject(createSpawnResult(chunks, errorChunks, -1, error));
        });

        spawnProcess.on("close", (code) => {
            console.log('Encountered close');

            if (code !== 0) {
                reject(createSpawnResult(chunks, errorChunks, code));
                return;
            }

            resolve(createSpawnResult(chunks, errorChunks, code));
        });
    });
}