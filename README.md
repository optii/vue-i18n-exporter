# VueJS i18n Exporter

A Command line utility to export [vue-i18n](https://github.com/kazupon/vue-i18n) translations to a file. This lib is probably not adapted to every vue project and will probably depend highly on your setup.


## Install

```
npm i -g @optii/i18n-exporter
```

## Usage

I advise that you don't overwrite your existing `base` file, or at least back it up, just in case this tool doesn't correctly detect the previous translations.

### help
```
i18n-exporter --help
```

### options

| options      | default            | description                       |
|--------------|--------------------|-----------------------------------|
| -d --dir     | `./src`            | Directory to find translations in |
| -o --out     | `./output.js`      | Output translation file           |
| -b --base    | `./src/lang/en.js` | Previous translation file (to merge with, keeps any already translated values), if changed this must be an absolute path |
| -c --compile | `./compiled`       | A temp file use to create a compilation of `base` file is auto deleted at the end |
| -h --help    | `none`             | shows the help                    |
