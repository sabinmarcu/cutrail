import { checkFfmpegAvailability } from '../src/infra/ffmpeg/checkFfmpegAvailability.ts';
import { resolveFfmpegPath } from '../src/infra/ffmpeg/resolveFfmpegPath.ts';

const requireBundled = process.env.CUTRAIL_ALLOW_SYSTEM_FFMPEG !== '1';

const resolution = resolveFfmpegPath();
const availability = await checkFfmpegAvailability({ ffmpegPath: resolution.path });

if (requireBundled && resolution.source !== 'BUNDLED') {
  console.error(
    `Expected bundled ffmpeg but resolved ${resolution.source} at ${resolution.path}. `
      + 'Set CUTRAIL_ALLOW_SYSTEM_FFMPEG=1 to allow fallback.',
  );
  process.exit(1);
}

if (!availability.available) {
  console.error(
    `FFmpeg runtime verification failed: ${availability.code} (${availability.error ?? 'unknown error'})`,
  );
  process.exit(1);
}

console.log(`FFmpeg runtime verified: ${availability.path} (${availability.source})`);
console.log(availability.versionLine ?? 'No version line returned by ffmpeg -version');
