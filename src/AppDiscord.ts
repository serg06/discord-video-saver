import {
    ArgsOf,
    Client,
    Discord,
    On,
    Once
} from "@typeit/discord";
import {Channel, DMChannel, GuildChannel, NewsChannel, TextChannel} from "discord.js";
import {downloadClip, getMaxClipSize} from './download2';
import {SpawnResult} from "./spawn-util";
import * as fs from "fs";
import {getTempFileName} from "./tmpfilenames";


const DISCORD_MSG_SIZE_LIMIT = 2000;


function IsGuildChannel(c: Channel): c is GuildChannel {
    return 'name' in c;
}


function formatBacktick(s: any) {
    return ['`', `${s}` || ' ', '`'].join('');
}

function formatTripleBacktick(s: any) {
    return ['```', `${s}` || ' ', '```'].join('');
}


function formatDiscordErrorMsg(url: string, code: number, stdout: string, stderr: string) {
    const longMessage = [
        `Failed to download clip: \`${url}\`.`,
        `code: ${formatBacktick(code)}`,
        `stdout: ${formatTripleBacktick(stdout)}`,
        `stderr: ${formatTripleBacktick(stderr)}`,
    ].join('\n');

    if (longMessage.length <= DISCORD_MSG_SIZE_LIMIT) {
        return longMessage;
    }

    const shortMessage = [
        `Failed to download clip: \`${url}\`.`,
        `code: ${formatBacktick(code)}`
    ];

    const files = [[stdout, 'stdout.txt'], [stderr, 'stderr.txt']].filter(([s, suffix]) => s).map(([s, suffix]) => {
        const fname = getTempFileName(suffix);
        fs.writeFileSync(fname, Buffer.from(s, 'utf8'));
        return fname;
    });

    const fullShortMessage = {
        content: shortMessage,
        files
    };

    return files.length ? fullShortMessage : shortMessage;
}


@Discord()
abstract class AppDiscord {
    @On("message")
    async onMessage(
        [message]: ArgsOf<"message">, // Type message automatically
        client: Client, // Client instance injected here,
        guardPayload: any
    ) {
        if (!IsGuildChannel(message.channel)) {
            return;
        }

        if (message.author.bot) {
            return;
        }

        const text = message.content;
        const cname = message.channel.name;

        console.log(`onMessage: [${cname}: ${text}]`);

        if (cname !== 'clips') {
            return;
        }

        const urls = text.split(/\s+/).filter(u => ['youtube.com', 'twitch.tv'].filter(host => u.toLowerCase().includes(host)).length);
        if (urls.length === 0) {
            return;
        }

        const url = urls[0];

        const resultmsg = await message.channel.send(`Downloading clip: \`${url}\``);

        await this.downloadAndShare(url, message.channel);

        await resultmsg.delete();
    }

    async downloadAndShare(url: string, channel: TextChannel | NewsChannel) {
        let downloadPath;

        try {
            downloadPath = await downloadClip(url, getMaxClipSize(channel.guild.premiumTier));
        } catch (err) {
            const {code, stdout, stderr} = err as SpawnResult;
            const errMsg = formatDiscordErrorMsg(url, code, stdout, stderr);
            await channel.send(errMsg);
            return;
        }

        await channel.send({
            content: `Downloaded clip: \`${url}\``,
            files: [downloadPath]
        });

        return;
    }

    @Once("messageDelete")
    private onMessageDelete() {
        console.log(`onMessageDelete`);
    }
}
