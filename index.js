#!/usr/bin/env node --harmony

'use strict'

const app = require('commander');
const chalk = require('chalk');
const Tasks = require('./lib/tasks');
const UI = require('./lib/ui');


const ui = new UI(); // initialize the UI

app
  .version(require('./package.json').version, '-V, --version')
  .option('-v, --verbose', 'shows you every single step')
  .option('-z, --nfz', 'displays informations related to website report operating procedure, AKA NF Z67-147 in France.')
  .option('-m, --mute', 'shows only the results of the analysis')

app
  .command('scan [url]')
  .alias('s')
  .description('Scans an url')
  .option('-f, --fonts', 'checks if any font is loading externally', true)
  .option('-s, --ssl', 'checks for SSL certificate', true)
  .option('-p, --prefetching', 'checks for DNS prefetching')
  .option('-a, --analytics', 'checks for Google Analytics & Piwik')
  .option('-t, --tracking', 'checks for Social Media tracking & embeds')
  .option('-c, --cdn', 'checks for Content Delivery Networks')
  .option('-k, --cookies [expiration delay, in month]', 'checks for cookies lifetime (< 13 month by defaut)', false)
  //.option('-r, --recursive', 'tries to follow links to check every internal site', false)
  .action((url, args) => {
    // Error Handling
    if (typeof url === 'undefined') {
      ui.error('\nYou have to set an URL.\n', false);
      process.exit(1);
    }
    if (url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/) === null) {
      ui.error('\nYou have to set a valid URL.', false);
      ui.info(chalk.dim('e.g. https://example.com or example.com\n'));
      process.exit(1);
    }
    if (args.parent.verbose && args.parent.mute) {
      ui.error('\nYou have to choose between silent or verbose mode!\n', false);
      process.exit(1);
    }

    if (args.parent.verbose) ui.set('verbose');
    if (args.parent.mute) ui.set('silent');

    // initialize the task runner
    const tasks = new Tasks(url, ui, args);

    if (args.parent.nfz) tasks.new('nfz');
    if (args.ssl) tasks.new('ssl');
    if (args.cookies) tasks.new('cookies');
    if (args.fonts) tasks.new('fonts');
    if (args.prefetching) tasks.new('prefetching');
    if (args.analytics) tasks.new('analytics');
    if (args.cdn) tasks.new('cdn');
    if (args.tracking) tasks.new('social');

    tasks.run();
  });

app
  .command('help [command]')
  .description('shows the help for a specific command')
  .action(command => {
    if (!command) {
      app.help();
    } else {
      // specific help
      //app.help(command);
    }
  });

app.parse(process.argv);

//if (!app.args.length) app.help();
