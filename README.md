@verygoodgraphics/vgg-cli
=================

Command-line tool that converts design files into VGG format.

> Note vgg-cli rely on Daruma's online service for conversion. By using vgg-cli, we assume you agree with Daruma's [terms of service](https://daruma.run/terms) and [privacy policy](https://daruma.run/privacy).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@verygoodgraphics/vgg-cli.svg)](https://npmjs.org/package/@verygoodgraphics/vgg-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@verygoodgraphics/vgg-cli.svg)](https://npmjs.org/package/@verygoodgraphics/vgg-cli)


# Usage
```sh-session
$ npm install -g @verygoodgraphics/vgg-cli
$ vgg-cli convert xxx.fig
Saved as "xxx.daruma"
```
# Development Usage

```sh-session
$ pnpm install
$ pnpm run build
$ ./bin/run.js --help # running built scripts in `dist` folder
$ ./bin/dev.js --help # running original scripts in `command` folder
$ ./bin/dev.js convert xxx.fig
Saved as "xxx.daruma"
```

# FAQ

## What is VGG format?

VeryGoodGraphics (VGG) is a next-gen vector graphics format which is defined in [VGG Specs](https://docs.verygoodgraphics.com/specs/overview).

## What is .daruma file?

Daruma file conforms to [VGG File Spec](https://docs.verygoodgraphics.com/specs/file) which is just a zip of JSONs.

## Why do I need network access?

The conversion is done online by Daruma, which requires network access.


For more questions, please join our [Discord channel](https://discord.gg/89fFapjfgM).
