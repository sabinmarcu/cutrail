import { spawn } from 'node:child_process';
import { resolveFfmpegPath } from './resolveFfmpegPath.ts';

export type SourceAudioTrack = {
  trackIndex: number;
  streamIndex: number;
  label: string;
  isDefault: boolean;
  waveformDataUrl: string | null;
};

type ParsedTrack = Omit<SourceAudioTrack, 'label'> & {
  title: string | null;
};

type CaptureResult = {
  stdout: Buffer;
  stderr: string;
};

const captureFfmpeg = (
  ffmpegPath: string,
  arguments_: string[],
  { acceptNonZeroExit = false }: { acceptNonZeroExit?: boolean } = {},
): Promise<CaptureResult> => new Promise((resolve, reject) => {
  const child = spawn(ffmpegPath, arguments_, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  child.stdout.on('data', (chunk) => {
    stdoutChunks.push(Buffer.from(chunk as Uint8Array));
  });
  child.stderr.on('data', (chunk) => {
    stderrChunks.push(Buffer.from(chunk as Uint8Array));
  });
  child.once('error', reject);
  child.once('close', (exitCode) => {
    const stdout = Buffer.concat(stdoutChunks);
    const stderr = Buffer.concat(stderrChunks).toString('utf8');

    if (!acceptNonZeroExit && exitCode !== 0) {
      reject(new Error(stderr.trim() || `ffmpeg exited with code ${String(exitCode)}`));

      return;
    }

    resolve({
      stdout,
      stderr,
    });
  });
});

const buildTrackLabel = (trackIndex: number, title: string | null): string => {
  const normalizedTitle = typeof title === 'string' ? title.trim() : '';

  return normalizedTitle.length > 0 ? normalizedTitle : `Track ${trackIndex + 1}`;
};

const parseTracks = (stderr: string): SourceAudioTrack[] => {
  const lines = stderr.split(/\r?\n/u);
  const parsedTracks: ParsedTrack[] = [];
  let currentTrack: ParsedTrack | null = null;

  for (const line of lines) {
    const streamMatch = line.match(/Stream #\d+:(\d+)(.*): Audio: ([^,]+)(.*)$/u);

    if (streamMatch) {
      currentTrack = {
        trackIndex: parsedTracks.length,
        streamIndex: Number(streamMatch[1]),
        isDefault: line.includes('(default)'),
        title: null,
        waveformDataUrl: null,
      };
      parsedTracks.push(currentTrack);
    } else if (currentTrack) {
      const titleMatch = line.match(/^\s*title\s*:\s*(.+)$/iu);

      if (titleMatch) {
        currentTrack.title = titleMatch[1].trim();
      }
    }
  }

  const tracks = parsedTracks.map((track, trackIndex) => ({
    ...track,
    trackIndex,
    label: buildTrackLabel(trackIndex, track.title),
  }));

  if (tracks.length > 1 && !tracks.some((track) => track.isDefault)) {
    tracks[0] = {
      ...tracks[0],
      isDefault: true,
    };
  }

  return tracks;
};

export const readSourceAudioTrackWaveformDataUrl = async (
  sourcePath: string,
  trackIndex: number,
): Promise<string | null> => {
  const ffmpegPath = resolveFfmpegPath().path;
  const { stdout } = await captureFfmpeg(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    sourcePath,
    '-filter_complex',
    // Keep filter args compatible with the bundled ffmpeg build used in production.
    `[0:a:${trackIndex}]aformat=channel_layouts=mono,showwavespic=s=2048x96:colors=0x35ff95:scale=sqrt[wave]`,
    '-map',
    '[wave]',
    '-frames:v',
    '1',
    '-vcodec',
    'png',
    '-f',
    'image2pipe',
    'pipe:1',
  ]);

  return stdout.length > 0
    ? `data:image/png;base64,${stdout.toString('base64')}`
    : null;
};

export const readSourceAudioTracks = async (sourcePath: string): Promise<SourceAudioTrack[]> => {
  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    throw new TypeError('sourcePath must be a non-empty string');
  }

  const ffmpegPath = resolveFfmpegPath().path;
  const metadata = await captureFfmpeg(ffmpegPath, [
    '-hide_banner',
    '-i',
    sourcePath,
  ], {
    acceptNonZeroExit: true,
  });

  return parseTracks(metadata.stderr);
};
