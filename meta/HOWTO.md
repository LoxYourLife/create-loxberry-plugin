# Your Plugin Template

Nice that you want to start the development of your plugin. You have to start somewhere, and with this template 
you're ready to go. You will find some sections which might be helpful for you. 

{{#if plugin.node}}
## Node JS Plugin Development

Welcome to the bright side of JS development, you have some nice features available which help you develop your program.
You can code totally offline and use the loxberry-express-dev-server for your local development. This server is in sync
with the latest changes of the express plugin feature. Everything is already set up and you can directly start coding.

To run the server simply run `npm run dev` and then you can open http://localhost:3300/admin/express/plugins/<plugin_name> in the browser.
Whenever you save changes, the server is automatically reloaded that you directly see the latest changes.

Keep an eye on the [Loxberry Express Release Page](https://github.com/LoxYourLife/loxberry-express/releases) and check 
for new versions and the changes.
{{/if}}
{{#if plugin.php}}
## PHP Plugin Development

Welcome to the bright side of PHP development. You can directly start uploading your plugin and start development
on the loxberry. Just zip the folder and install your new plugin on your loxberry.
{{/if}}
{{#if plugin.perl}}
## PERL Plugin Development

Welcome to the bright side of Perl development. You can directly start uploading your plugin and start development
on the loxberry. Just zip the folder and install your new plugin on your loxberry.
{{/if}}

Happy Coding

## Release Automation

You have the possibility to automate your releases with just a simple command. An requirement to do so is a local 
installation of NodeJs and NPM. Once you have this, it's straight forward and pretty simple to use.

Whenever you want to create a release or prerelease you need to decide for a version number. Let's say you want to publish
your first version "1.0.0". Make sure, that in the `package.json` you have a version lower than "1.0.0" (only required on first release).

Run `npm run release:major` and go through the steps. So easy.

Let's have a look at what's actually happening. 
* Check if the configuration in `package.json` is correct.
* Check that you have no uncommited changes
* Asking you, if you really want to release
* Changeing to the next specified level
* Asking you if the version number fits
  * In case you say no, all changes are reverted and the process is stopped
* Bump up versions for additional node modules (if configured)
* Updating `plugin.cfg`
* Updating `prerelease.cfg` (only when pre release)
* Updating `release.cfg` (only whhen release)
* Generating a changelog from commits, see this [documentation](https://github.com/lob/generate-changelog) on how to format your commit messages
* Executing additional commands (if configured)
* Stage changes to git
* Asking you if the changes files are correct
  * In case you say no, all changes are reverted
* Commit the changes
* Create a new tag
* Push changes and the new tag to GitHub.
* Done

If you want to automatically generate the release docs on GitHub as well, enable "GitHub Actions" in your account and 
rename the file `release.yml.tmpl` to `release.yml` in `.github/workflows/` folder. Whenever you publish a new tag, the 
release notes are generated for you. Keep in mind to follow the commit format from the [documentation](https://github.com/lob/generate-changelog)
