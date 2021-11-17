# Loxberry Plugin Generator

**Attention**

> This is currently under development. No guarantee that everything works!

This is a plugin generator for Loxberry Plgugins. It will ask ou lot's of questions and based on the answers generate a loxberry plugin template.
It's avaialable for `Perl`, `PHP` and `NodeJS - Express`. After generating the template you can directly install it on Loxberry.

## How to genrate a template

You need at least [Node] >=v12.10.0 and [NPM] to use this generator.
Simply run `npm init loxberry-template <installationFolder>`.

## Special Features for the NodeJS Express Version

You can develop locally with nodejs if you want to. Simply navigate to your installation folder and run `npm run dev`.
You can than access http://localhost:3000.

Documentation for the node express development cvan be found here: [Express Plugin]

[nodejs]: https://nodejs.dev/
[npm]: https://www.npmjs.com/
[express plugin]: https://github.com/LoxYourLife/loxberry-express
