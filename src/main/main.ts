import { app } from 'electron';

import { runCutrailCli } from '../cli/cutrailCli.ts';
import { setCliStartupPaths } from './cliStartupPaths.ts';
import { registerMediaSchemes } from './mediaProtocol.ts';

registerMediaSchemes();

const startFromCli = async (): Promise<void> => {
	const result = await runCutrailCli({
		argv: process.argv.slice(2),
		cwd: process.cwd(),
		stderr: process.stderr,
		stdout: process.stdout,
		version: app.getVersion(),
	});

	if (!result.shouldStartApp) {
		app.exit(result.exitCode);

		return;
	}

	setCliStartupPaths(result.startupPaths);

	const { registerAppBootstrap } = await import('./bootstrap.ts');
	registerAppBootstrap();
};

void startFromCli().catch((error) => {
	const errorText = error instanceof Error ? error.stack ?? error.message : String(error);
	process.stderr.write(`${errorText}\n`);
	app.exit(1);
});
