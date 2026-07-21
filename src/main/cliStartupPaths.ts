let cliStartupPaths: string[] = [];

const setCliStartupPaths = (paths: string[]): void => {
  cliStartupPaths = [...paths];
};

const getCliStartupPaths = (): string[] => [...cliStartupPaths];

export {
  getCliStartupPaths,
  setCliStartupPaths,
};
