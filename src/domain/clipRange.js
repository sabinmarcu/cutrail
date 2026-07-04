export const normalizeRange = (startSeconds, endSeconds) => {
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
    throw new TypeError('startSeconds and endSeconds must be finite numbers');
  }

  const start = Math.max(0, Math.min(startSeconds, endSeconds));
  const end = Math.max(startSeconds, endSeconds);

  return {
    start,
    end,
    duration: end - start,
  };
};
