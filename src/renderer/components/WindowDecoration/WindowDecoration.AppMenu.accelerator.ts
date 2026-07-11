const APPLE_PLATFORM_PATTERN = /(mac|iphone|ipad|ipod)/i;

const getPlatformLabel = (): 'Cmd' | 'Ctrl' => {
  const platform = globalThis.navigator?.platform
    ?? globalThis.navigator?.userAgent
    ?? '';

  return APPLE_PLATFORM_PATTERN.test(platform) ? 'Cmd' : 'Ctrl';
};

const formatAcceleratorLabel = (accelerator: string): string => {
  const commandLabel = getPlatformLabel();

  return accelerator.replaceAll('CmdOrCtrl', commandLabel);
};

export {
  formatAcceleratorLabel,
};
