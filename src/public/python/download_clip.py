import argparse
import asyncio
import re
import string
import sys
from collections import OrderedDict
from pathlib import Path
from typing import Optional

import streamlink
from aioify import aioify
from furl import furl
from loguru import logger
from pytube import YouTube
from streamlink.stream import Stream

ONE_MB = 1024 * 1024
CHUNK_SIZE = ONE_MB


def normalizeUrl(url):
    """
    ParseResult(scheme='https', netloc='www.tWitch.tv', path='/ludwig/clip/MoldyNiceMarjoramCharlieBitMe-6EbApxzSGbjacptE', params='', query='a=b&c=d', fragment='')

    Wish I could convert clips like this:
        https://www.twitch.tv/ludwig/clip/MoldyNiceMarjoramCharlieBitMe-6EbApxzSGbjacptE
    To ones like this:
        https://clips.twitch.tv/MoldyNiceMarjoramCharlieBitMe-6EbApxzSGbjacptE
    """

    f = furl(url)
    f.path.normalize()
    if f.host == 'www.twitch.tv' or f.host == 'twitch.tv':
        m = re.match('^/[^/]+/clip/[^/]+.*$', str(f.path))
        if m is not None:
            # TODO: Yeah
            pass

    return f.url


def downloadYoutubeClip(url, max_size, output_path):
    logger.trace(f'Downloading: {url}')
    yt = YouTube(url)

    # Get all videos, sorted by file size
    streams = yt.streams.filter(type='video', subtype='mp4').order_by('filesize').desc()
    streams = [s for s in streams if s.includes_audio_track and s.includes_video_track]

    if len(streams) == 0:
        raise Exception('Could not find any video streams.')

    # Find the largest one possible
    stream = None
    for stream_ in streams:
        if stream_.filesize <= max_size:
            stream = stream_
            break

    # None is small enough
    if stream is None:
        raise Exception(
            f'Could not find a stream that was <{max_size / ONE_MB}MB. (Smallest was {streams[-1].filesize / ONE_MB} MB.)')

    # Download the stream
    logger.trace(f'Downloading to {Path(output_path).parent} / {Path(output_path).name}')
    stream.download(filename=Path(output_path).stem, output_path=f'{Path(output_path).parent}')


def sortStreamlinkStreamsByQualityDesc(streams: OrderedDict) -> OrderedDict:
    lst = [(k, v) for k, v in streams.items()]

    # Remove non-numbers (like 'worst' and 'best')
    lst = [(k, v) for k, v in lst if k[0] in string.digits]

    # Sort by largest number at start
    lst.sort(key=lambda x: int(re.sub(r'[^0-9]+', '', x[0])), reverse=True)

    # Done
    return OrderedDict(lst)


def downloadAnyClip(url, max_size, output_path):
    logger.trace(f'Downloading: {url}')

    streamlink_session = streamlink.Streamlink({'hls-segment-threads': 1})

    # Get streams
    streams = streamlink_session.streams(url)

    # Sort by quality
    streams = sortStreamlinkStreamsByQualityDesc(streams)

    logger.trace(f'streams: {streams}')

    # Try each one until one works.
    downloaded = False
    for name, stream in streams.items():
        logger.trace(f'trying stream: {name}')
        success = downloadStreamlinkStream(stream, max_size, output_path)
        if success:
            logger.trace(f'success!')
            downloaded = True
            break
        else:
            if Path(output_path).exists():
                Path(output_path).unlink()

    # None is small enough
    if not downloaded:
        raise Exception(f'Could not find a stream that was <{max_size / ONE_MB}MB.')


class UrlType:
    YOUTUBE = 'youtube'
    TWITCH = 'twitch'


def getUrlType(url: str) -> Optional[str]:
    f = furl(url)
    if f.scheme is None:
        return None
    elif not f.scheme.startswith('http'):
        return None
    elif f.host is None:
        return None

    if 'youtube' in f.host:
        return UrlType.YOUTUBE
    elif 'twitch' in f.host:
        return UrlType.TWITCH
    else:
        return None


@aioify
def downloadClip(url, max_size, output_path):
    url_type = getUrlType(url)
    if url_type == UrlType.YOUTUBE:
        try:
            return downloadYoutubeClip(url, max_size, output_path)
        except Exception as e:
            return downloadAnyClip(url, max_size, output_path)
    if url_type == UrlType.TWITCH:
        return downloadAnyClip(url, max_size, output_path)
    else:
        raise Exception(f'Invalid URL type for URL: {url}')


def downloadStreamlinkStream(stream: Stream, max_size, output_path) -> bool:
    fd = stream.open()

    total_bytes_written = 0

    with open(output_path, 'wb') as f:
        while True:
            chunk_bytes = fd.read(CHUNK_SIZE)
            if not chunk_bytes:
                # Done
                break

            # Write chunk to file
            num_bytes_written = f.write(chunk_bytes)

            # Keep track of total bytes we've written
            total_bytes_written += num_bytes_written

            if total_bytes_written > max_size:
                logger.trace(f'stream failed due to large size: {total_bytes_written / ONE_MB}MB')
                break

    success = total_bytes_written <= max_size
    if success:
        logger.trace(f'stream succeeded with size: {total_bytes_written / ONE_MB}MB')
    return success


async def main():
    parser = argparse.ArgumentParser(description='Download a clip.')
    parser.add_argument('--url', required=True, help='url of the clip')
    parser.add_argument('--max-size', type=int, required=True, help='max size of the clip in bytes')
    parser.add_argument('--output-path', required=True, help='output destination of the clip')

    args = parser.parse_args()

    try:
        await downloadClip(args.url, args.max_size, args.output_path)
    except Exception as e:
        print(f'Error: {e}')
        exit(1)


if __name__ == '__main__':
    logger.remove()
    logger.add(**{
        'sink': sys.stderr,
        'level': 'TRACE'
    })
    asyncio.run(main())
