# Disc Features File Naming

This package renames a folder of ripped disc features using timecodes from [dvdcompare.net](https://dvdcompare.net).

## Installation

```sh
yarn install
yarn dlx @yarnpkg/sdks vscode
```

## Usage

```sh
yarn start FOLDER_LOCATION DVD_COMPARE_LINK
```

- `FOLDER_LOCATION`: The absolute path of the directory with your features.
- `DVD_COMPARE_LINK`: The link needs a hash at the end to tell DVD Compare which release package you've selected.

### EXAMPLE

```sh
yarn start 'G:\Disc-Rips\Ford v Ferrari bonus' https://dvdcompare.net/comparisons/film.php?fid=52929#1
```
