// import parseUrl from "parse-url";
// import {URL} from "url";
//
// const ONE_MB = 1024 * 1024;
// const MAX_CLIP_SIZE = 7.5 * ONE_MB;
// const CHUNK_SIZE = ONE_MB;
//
// enum UrlType {
//     TWITCH = 'twitch',
//     YOUTUBE = 'youtube'
// }
//
// interface ParsedUrl {
//     urlstring: string;
//     type: UrlType;
// }
//
// function IsTwitchUrl(url: ParsedUrl): url is ParsedTwitchUrl {
//     return url.type === UrlType.TWITCH;
// }
//
// function IsYoutubeUrl(url: ParsedUrl): url is ParsedYoutubeUrl {
//     return url.type === UrlType.YOUTUBE;
// }
//
// interface ParsedTwitchUrl extends ParsedUrl {
//     type: UrlType.TWITCH;
//     clip_id: string;
// }
//
// interface ParsedYoutubeUrl extends ParsedUrl {
//     type: UrlType.YOUTUBE;
//     clip_id: string;
// }
//
// function parseClipUrl(urlstring: string): ParsedTwitchUrl | ParsedYoutubeUrl {
//     const url1 = new URL(urlstring);
//     const url2 = parseUrl(urlstring);
//     const path = url1.pathname.split('/').slice(1);
//
//     const host = url2.resource.toLowerCase();
//     if (host.includes('youtube')) {
//         if (path.length !== 0 && url2.query.v === undefined) {
//             throw Error("Cannot parse Youtube clip url: Invalid url path");
//         }
//         return {
//             urlstring,
//             type: UrlType.YOUTUBE,
//             clip_id: url2.query.v
//         };
//     } else if (host.includes('clips.twitch.tv')) {
//         if (path.length !== 1) {
//             throw Error("Cannot parse Twitch clip url: Invalid url path");
//         }
//         return {
//             urlstring,
//             type: UrlType.TWITCH,
//             clip_id: path[0]
//         };
//     } else {
//         throw Error("Unknown clip type");
//     }
// }
//
// async function downloadParsedClipUrl(url: ParsedUrl) {
//     if ()
// }
//
// export async function downloadClip(urlstr: string) {
//     const parsed = parseClipUrl(urlstr);
//
//     console.log('');
// }
