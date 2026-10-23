/**
 * PersianClean - CLI Command Runner
 */

const fs = require('fs');
const path = require('path');
const ansi = require('./ansi');
const { cleanPersianText, getCleaningStats } = require('../core/index');

function parseArgs(args) {
  const options = {
    command: null,
    target: null,
    output: null,
    zwnj: true,
    normalizeChars: true,
    digits: 'fa',
    fixPunctuation: true,
    port: 3027,
    json: false
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--no-zwnj') {
      options.zwnj = false;
    } else if (arg === '--no-chars') {
      options.normalizeChars = false;
    } else if (arg === '--no-punct') {
      options.fixPunctuation = false;
    } else if (arg === '--digits') {
      options.digits = args[++i];
    } else if (arg === '--port' || arg === '-p') {
      options.port = parseInt(args[++i], 10);
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('-')) {
      // Ignored unknown flags
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    const first = positional[0].toLowerCase();
    if (['clean', 'text', 'stats', 'ui', 'help', 'version'].includes(first)) {
      options.command = first;
      options.target = positional.slice(1).join(' ');
    } else {
      options.command = 'clean';
      options.target = positional[0];
    }
  }

  return options;
}

function printHelp() {
  console.log(ansi.banner());
  console.log(`
${ansi.bold('Usage:')} ${ansi.cyan('persian-clean')} [command] [options]

${ansi.bold('Commands:')}
  ${ansi.cyan('clean')} <file>           Clean, apply ZWNJ, and beautify a text or markdown file
  ${ansi.cyan('text')} "<string>"       Clean raw Persian text directly from the command line
  ${ansi.cyan('stats')} <file>          Show typographical metrics and ZWNJ count for a file
  ${ansi.cyan('ui')}                    Launch interactive Web Studio dashboard (Port 3027)
  ${ansi.cyan('version')}               Show PersianClean version
  ${ansi.cyan('help')}                  Display this help message

${ansi.bold('Options:')}
  ${ansi.yellow('-o, --output <file>')}     Save cleaned output to specified file
  ${ansi.yellow('--no-zwnj')}               Disable automated ZWNJ (نیم‌فاصله) injection
  ${ansi.yellow('--no-chars')}              Disable Arabic-to-Persian character unification (ی/ک)
  ${ansi.yellow('--no-punct')}              Disable punctuation & quote formatting
  ${ansi.yellow('--digits <fa|en|none>')}   Digit conversion mode (default: fa)
  ${ansi.yellow('-p, --port <n>')}          Port for Web Studio dashboard (default: 3027)
  ${ansi.yellow('--json')}                  Output results as structured JSON

${ansi.bold('Examples:')}
  $ ${ansi.dim('persian-clean clean article.md -o article-clean.md')}
  $ ${ansi.dim('persian-clean text "كتاب ها و خانه ام زیبا تر است."')}
  $ ${ansi.dim('persian-clean stats paper.txt')}
  $ ${ansi.dim('persian-clean ui --port 3027')}
`);
}

async function runCli(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.command === 'help' || argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return;
  }

  if (options.command === 'version' || argv.includes('--version') || argv.includes('-v')) {
    const pkg = require('../../package.json');
    console.log(`PersianClean v${pkg.version}`);
    return;
  }

  if (options.command === 'ui') {
    const { startServer } = require('../server/server');
    startServer({ port: options.port });
    return;
  }

  if (options.command === 'text') {
    const raw = options.target;
    if (!raw) {
      console.error(ansi.red('Error: Please provide text to clean. E.g. persian-clean text "سلام دنیا"'));
      process.exitCode = 1;
      return;
    }

    const cleaned = cleanPersianText(raw, options);
    const stats = getCleaningStats(raw, cleaned);

    if (options.json) {
      console.log(JSON.stringify({ raw, cleaned, stats }, null, 2));
      return;
    }

    console.log(`\n${ansi.badge('CLEANED TEXT', 'success')}\n`);
    console.log(cleaned);
    console.log(`\n${ansi.dim(`Metrics: ${stats.zwnjAdded} ZWNJs added, ${stats.arabicCharsFixed} Arabic glyphs unified.`)}\n`);
    return;
  }

  if (options.command === 'stats') {
    if (!options.target || !fs.existsSync(options.target)) {
      console.error(ansi.red(`Error: File not found: "${options.target}"`));
      process.exitCode = 1;
      return;
    }

    const content = fs.readFileSync(path.resolve(options.target), 'utf8');
    const cleaned = cleanPersianText(content, options);
    const stats = getCleaningStats(content, cleaned);

    console.log(`\n${ansi.bold(ansi.cyan('─── Persian Typography Metrics ───'))}`);
    console.log(`  File Path           : ${ansi.bold(options.target)}`);
    console.log(`  Word Count          : ${stats.wordCount}`);
    console.log(`  Character Count     : ${stats.charCount}`);
    console.log(`  Existing ZWNJ       : ${stats.totalZwnj - stats.zwnjAdded}`);
    console.log(`  Missing ZWNJ Added  : ${ansi.green(stats.zwnjAdded)}`);
    console.log(`  Arabic Glyphs Fixed : ${ansi.yellow(stats.arabicCharsFixed)}`);
    console.log(`  Status              : ${stats.isModified ? ansi.yellow('Needs Cleaning') : ansi.green('Already Clean')}\n`);
    return;
  }

  // Default: clean <file>
  if (!options.target) {
    printHelp();
    return;
  }

  const filePath = path.resolve(options.target);
  if (!fs.existsSync(filePath)) {
    console.error(ansi.red(`Error: File not found: "${options.target}"`));
    process.exitCode = 1;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = cleanPersianText(content, options);
  const stats = getCleaningStats(content, cleaned);

  if (options.output) {
    const outPath = path.resolve(options.output);
    fs.writeFileSync(outPath, cleaned, 'utf8');
    console.log(`\n${ansi.badge('SUCCESS', 'success')} Cleaned file saved to: ${ansi.cyan(outPath)}`);
    console.log(`  ${ansi.dim(`Injected ${stats.zwnjAdded} ZWNJs and fixed ${stats.arabicCharsFixed} Arabic glyphs.`)}\n`);
  } else {
    console.log(cleaned);
  }
}

module.exports = {
  parseArgs,
  runCli,
  printHelp
};
