const prompts = require('prompts');
const { exec } = require('./helpers');

const githubRepo = (name) => ({
  type: 'text',
  name: 'github',
  initial: undefined,
  format: async (value) => {
    if (value == '') return undefined;

    name = name.replace(/ +/gi, '-');

    const repoConfirm = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: `Does this look okay? https://github.com/${value}/${name}`
    });

    if (repoConfirm.confirmed) {
      return {
        organisation: value,
        repo: name,
        url: `git@github.com:${value}/${name}.git`
      };
    }
    return (await prompts(githubRepo(name)));
  },
  message: 'Whats your Github namespace? Typically your name or organizations name?'
});

const pluginQuestions = async (defaultExpressVersion, suggestedName) => {
  console.log('Please answer the following questions as good as you can.');
  console.log('');

  const author = await prompts([
    {
      type: 'text',
      initial: await exec('git', ['config', 'user.name']),
      name: 'name',
      message: `What's your name?`
    },
    {
      type: 'text',
      initial: await exec('git', ['config', 'user.email']),
      name: 'email',
      message: `What's your email?`,
      validate: (value) =>
        /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value) === false
          ? 'Please enter a valid email address'
          : true
    }
  ]);
  const plugin = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Which name should your Plugin have?',
      initial: suggestedName,
      validate: (value) => {
        if (/^([a-z0-9_\- ]+)$/i.test(value) === false)
          return `Please enter a valid name (Only lettrs, numbers and "-", "_")`;
        if (value.length >= 25) return `The plugin name shouldn't be longer than 25 characters`;
        return true;
      },
      format: async (value) => {
        const folderName = value.replace(/( )+/gi, '_').toLowerCase();
        const gitName = value.replace(/( )+/gi, '-').toLowerCase();
        return {
          title: value,
          name: folderName,
          git: gitName
        };
      }
    },
    {
      type: 'text',
      name: 'version',
      initial: '0.0.1',
      message: 'Whats your plugins version?',
      validate: (value) =>
        /^[0-9]{1,3}.[0-9]{1,5}(.[0-9]{1,5})?$/i.test(value) === false
          ? `Please enter a valid version number like  1.1.1`
          : true
    },
    {
      type: 'select',
      name: 'language',
      initial: 0,
      message: 'In which language do you want to write your plugin?',
      choices: [
        { title: 'Perl', value: 'perl' },
        { title: 'PHP', value: 'php' },
        { title: 'NodeJs', value: 'node' }
      ]
    }
  ]);

  let express = false;
  if (plugin.language === 'node') {
    const node = await prompts({
      type: 'confirm',
      initial: false,
      name: 'required',
      message: 'Do you need a specific version of the express plugin?',
      format: async (value) => {
        if (value === false) return defaultExpressVersion;

        const version = await prompts({
          type: 'text',
          name: 'version',
          message: 'Which version of the express plugin do you need?',
          validate: (value) =>
            /^[0-9]{1,3}.[0-9]{1,5}(.[0-9]{1,5})?$/i.test(value) === false
              ? `Please enter a valid version number like  1.1.1`
              : true
        });

        return version.version;
      }
    });

    express = node.required;
  }

  const git = await prompts([githubRepo(plugin.name.git)]);

  console.log('');
  console.log(`Nice! Let's see what you need for your plugin ...`);

  const backup = (
    await prompts({
      type: 'confirm',
      name: 'backup',
      message: 'Do you want to backup and restore your files on upgrade?'
    })
  ).backup;

  let pluginFunctionQuestions = [
    { name: 'autoupdate', message: 'Do you want to have auto update enabled?' },
    { name: 'daemon', message: 'Do you need a Daemon script?' },
    { name: 'preroot', message: 'Do you need a preroot script?' },
    { name: 'postroot', message: 'Do you need a postroot script?' },
    { name: 'preinstall', message: 'Do you need a preinstall script?' },
    { name: 'postinstall', message: 'Do you need a postinstall script?' },
    { name: 'preupgrade', message: 'Do you need a preupgrade script?' },
    { name: 'postupgrade', message: 'Do you need a postupgrade script?' },
    { name: 'config', message: 'Do you need a config folder?' },
    { name: 'dpkg', message: 'Do you need a dpkg folder?' },
    { name: 'bin', message: 'Do you need a bin folder?' },
    { name: 'cron', message: 'Do you need a cron folder?' },
    { name: 'data', message: 'Do you need a data folder?' },
    { name: 'uninstall', message: 'Do you need an uninstall script?' },
    { name: 'sudoers', message: 'Do you need an sudoers file?' },
  ];

  if (plugin.language === 'node') {
    pluginFunctionQuestions = pluginFunctionQuestions.filter(
      (question) => !['preroot', 'postinstall', 'postupgrade'].includes(question.name)
    );
  }

  const features = await prompts(
    pluginFunctionQuestions.map((question) => ({
      type: 'confirm',
      name: question.name,
      message: question.message,
      initial: true
    }))
  );

  if (plugin.language === 'node') {
    features.preroot = true;
    features.postinstall = true;
    features.postupgrade = true;
    features.express = express;
  }

  if (backup) {
    features.preupgrade = true;
    features.postupgrade = true;
  }
  features.icons = true;
  features.logs = true;
  features.backup = backup;

  return {
    author,
    plugin,
    github: git.github,
    features
  };
};
const pathExists = async (path) => {
  const remove = await prompts([
    {
      type: 'confirm',
      name: 'remove',
      message: `The path "${path}" does already exist. Do you want to override it?`
    }
  ]);

  return remove.remove;
};
module.exports = {
  pluginQuestions,
  pathExists
};
