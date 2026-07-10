import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { protocol } from 'electron';

const MEDIA_PROTOCOL = 'cutrail-media';

const registerMediaSchemes = (): void => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: MEDIA_PROTOCOL,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        corsEnabled: true,
      },
    },
  ]);
};

const decodeMediaPath = (requestUrl: string): string => {
  const parsed = new URL(requestUrl);

  if (parsed.protocol !== `${MEDIA_PROTOCOL}:`) {
    throw new Error('Unsupported media protocol');
  }

  const encodedPath = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
  const decodedPath = decodeURIComponent(encodedPath);
  const absolutePath = decodedPath.startsWith('file://') ? fileURLToPath(decodedPath) : decodedPath;
  const normalizedPath = path.normalize(absolutePath);

  if (!path.isAbsolute(normalizedPath)) {
    throw new Error('Media path must be absolute');
  }

  return normalizedPath;
};

const registerMediaProtocol = (): void => {
  protocol.registerFileProtocol(MEDIA_PROTOCOL, (request, callback) => {
    try {
      const filePath = decodeMediaPath(request.url);
      callback(filePath);
    } catch {
      callback({ error: -324 });
    }
  });
};

export {
  registerMediaProtocol,
  registerMediaSchemes,
};
