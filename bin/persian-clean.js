#!/usr/bin/env node

/**
 * PersianClean - Binary CLI Entrypoint
 */

const { runCli } = require('../src/cli/runner');

runCli().catch((err) => {
  console.error('\nFatal Error:', err.message || err);
  process.exit(1);
});
