#!/usr/bin/env node
const questionaire = require('./questionaire');
const path = require('path');
const fs = require('fs');
const util = require('util');
const rmdir = util.promisify(fs.rmdir);
const { copyRecursive, copyContentRecursive, renderFile, exec } = require('./helpers');

const DEFAULT_EXPRESS_VERSION = '2.0.2';

const pathChecks = async () => {
  const nodeVersion = await exec('node', ['--version']);
  if (nodeVersion < 'v12.10.0') {
    console.error('Your node version is to small, please isntall at least v12.10.0');
    process.exit(0);
  }
  const givenPath = process.argv[2];
  if (givenPath === undefined || givenPath === null || givenPath === '') {
    console.error('Instalation folder is empty and not given. Please provide a path, where to install the template.');
    process.exit(0);
  }
  const installationFolder = path.resolve(givenPath);

  if (fs.existsSync(installationFolder)) {
    const remove = await questionaire.pathExists(installationFolder);
    if (remove) {
      try {
        await rmdir(installationFolder, { recursive: true });
      } catch {
        console.error('cannot delete folder. Please delete it manually.');
        process.exit(0);
      }
    }
  }

  return installationFolder;
};
const getPluginInfo = async (suggestedName) => {
  return questionaire.pluginQuestions(DEFAULT_EXPRESS_VERSION, suggestedName);
};

const preUpgrade = (pluginConfig) => {
  let customContent = '';
  if (pluginConfig.features.backup) {
    const backupFolder = ['config', 'data', 'logs'].filter((name) => pluginConfig.features[name]);
    customContent += 'echo "<INFO> Creating temporary folders for upgrading"\n';
    customContent += 'mkdir -p /tmp/$PTEMPDIR\\_upgrade\n';
    customContent += backupFolder.reduce(
      (content, folder) => content + `mkdir -p /tmp/$PTEMPDIR\\_upgrade/${folder}\n`,
      ''
    );
    customContent += '\necho "<INFO> Backing up existing config files"\n';
    customContent += backupFolder.reduce(
      (content, folder) => content + `cp -p -v -r $P${folder.toUpperCase()} /tmp/$PTEMPDIR\\_upgrade/${folder}\n`,
      ''
    );
  }

  return customContent;
};
const postUpgrade = (pluginConfig) => {
  let customContent = '';
  if (pluginConfig.features.backup) {
    const backupFolder = ['config', 'data', 'logs'].filter((name) => pluginConfig.features[name]);
    customContent += 'echo "<INFO> Copy back existing backup"\n';
    customContent += backupFolder.reduce(
      (content, folder) => content + `cp -p -v -r /tmp/$PTEMPDIR\\_upgrade/${folder}/* $P${folder.toUpperCase()} \n`,
      ''
    );
    customContent += '\necho "<INFO> Remove temporary folders"\n';
    customContent += 'rm -r /tmp/$PTEMPDIR\\_upgrade\n\n';
  }
  if (pluginConfig.plugin.language === 'node') {
    customContent += 'echo "<INFO> installing dependencies"\n';
    customContent += 'npm --prefix $PHTMLAUTH ci --only=production\n\n';
    customContent += 'echo "<INFO> Register Plugin at Express Server"\n';
    customContent += `curl -X POST http://localhost:3300/system/express/plugin/${pluginConfig.plugin.name.name}\n\n`;
  }
  return customContent;
};

const preInstall = () => '';

const postInstall = (pluginConfig) => {
  let customContent = '';

  if (pluginConfig.plugin.language === 'node') {
    customContent += 'echo "<INFO> installing dependencies"\n';
    customContent += 'npm --prefix $PHTMLAUTH/express ci --only=production\n\n';
    customContent += 'echo "<INFO> copy .htaccess"\n';
    customContent += 'cp webfrontend/htmlauth/express/.htaccess $PHTMLAUTH/express/.htaccess\n\n';
  }
  return customContent;
};

const preRoot = () => '';

const postRoot = () => '';

const install = async () => {
  const installationFolder = await pathChecks();
  const suggestedName = path.basename(installationFolder);

  const pluginConfig = await getPluginInfo(suggestedName);

  console.log('');
  console.log('Installing content ...');
  fs.mkdirSync(installationFolder, { recursive: true });

  // write main config files
  for (const file of ['plugin.cfg', 'release.cfg', 'prerelease.cfg']) {
    await renderFile(path.resolve(__dirname, './meta/', file), path.resolve(installationFolder, file))(pluginConfig);
  }

  // copy meta folder and files
  const folders = ['cron', 'daemon', 'dpkg', 'icons', 'sudoers', 'uninstall'].filter(
    (name) => pluginConfig.features[name]
  );
  const rawfiles = ['preupgrade', 'postupgrade', 'preinstall', 'postinstall', 'preroot', 'postroot']
    .filter((name) => pluginConfig.features[name])
    .map((name) => `${name}.sh`);
  const files = ['README.md', 'LICENCE', 'HOWTO.md', ...rawfiles];
  folders.forEach((folder) =>
    copyRecursive(path.resolve(__dirname, './meta', folder), path.resolve(installationFolder, folder))
  );
  copyRecursive(path.resolve(__dirname, './meta/.github'), path.resolve(installationFolder, '.github'))
  files.forEach((file) =>
    fs.copyFileSync(path.resolve(__dirname, './meta', file), path.resolve(installationFolder, file))
  );

  // copy template
  copyContentRecursive(path.resolve(__dirname, `./template-${pluginConfig.plugin.language}`), installationFolder);

  // replace content in templates
  const contentReplace = {
    php: ['webfrontend/htmlauth/index.php', 'package.json', 'README.md', 'HOWTO.md'],
    perl: ['package.json', 'README.md', 'HOWTO.md'],
    node: [
      'webfrontend/htmlauth/express/package.json',
      'package.json',
      'README.md',
      'HOWTO.md'
    ]
  };

  pluginConfig.plugin[pluginConfig.plugin.language] = true;
  for (const file of contentReplace[pluginConfig.plugin.language]) {
    const fileName = path.resolve(installationFolder, file);
    await renderFile(fileName)(pluginConfig);
  }

  const emptyFolders = ['config', 'bin', 'data'].filter((name) => pluginConfig.features[name]);
  emptyFolders.forEach((folder) => {
    const installPath = path.resolve(installationFolder, folder);
    fs.mkdirSync(installPath);
    fs.writeFileSync(path.resolve(installPath, '.gitkeep'), '');
  });

  // Custom content for scripts
  const customContentForScripts = [
    { file: 'preroot.sh', content: preRoot(pluginConfig) },
    { file: 'postroot.sh', content: postRoot(pluginConfig) },
    { file: 'preupgrade.sh', content: preUpgrade(pluginConfig) },
    { file: 'postupgrade.sh', content: postUpgrade(pluginConfig) },
    { file: 'preinstall.sh', content: preInstall(pluginConfig) },
    { file: 'postinstall.sh', content: postInstall(pluginConfig) }
  ];

  for (const custom of customContentForScripts) {
    await renderFile(path.resolve(installationFolder, custom.file))({ custom: custom.content });
  }

  // setup git
  await exec('git', ['init'], { cwd: installationFolder });
  await exec('git', ['branch', '-m', 'master', 'main'], { cwd: installationFolder })
  await exec('git', ['remote', 'add', 'origin', pluginConfig.github.url], { cwd: installationFolder });

  // install dependencies
  console.log('Installing dependencies');
  await exec('npm', ['install'], { cwd: installationFolder });
  
  if (pluginConfig.plugin.language === 'node') {
    await exec('npm', ['install'], { cwd: path.resolve(installationFolder, 'webfrontend', 'htmlauth', 'express') });
  }

  console.log('');
  console.log('Installation finshed.');
  console.log(`Your plugin is available at ${installationFolder}`);
  console.log('Please exchange the blank icons ;) and have a look at HOWTO.md');
  console.log('');
  console.log('Happy Coding');
};

install();
