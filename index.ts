// Use the Client that are provided by @typeit/discord NOT discord.js
import {Client} from "@typeit/discord";
import {initDownloader} from "./src/download2";
import {initTmpFilenamesService} from "./src/tmpfilenames";
import dotenv from 'dotenv';

dotenv.config();

async function initApp() {
    await Promise.all([
        initDownloader(),
        initTmpFilenamesService()
    ]);
}

async function start() {
    await initApp();

    const client = new Client({
        classes: [
            `${__dirname}/src/*Discord.ts`, // glob string to load the classes
            `${__dirname}/src/*Discord.js` // If you compile using "tsc" the file extension change to .js
        ],
        silent: false,
        variablesChar: ":"
    });

    console.log('Logging in...');
    await client.login(`${process.env.DISCORD_BOT_KEY}`);
    console.log('Logged in!');
}

start();
