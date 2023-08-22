# Media File Tools

## Special Features File Naming

This package renames a folder of ripped disc special features using timecodes from [dvdcompare.net](https://dvdcompare.net).

### Installation

```sh
yarn install
yarn dlx @yarnpkg/sdks vscode
```

### Update

```sh
yarn set version stable
```

### Usage

```sh
yarn nameSpecialFeatures FOLDER_LOCATION DVD_COMPARE_LINK
```

- `FOLDER_LOCATION`: The absolute path of the directory with your features.
- `DVD_COMPARE_LINK`: The link needs a hash at the end to tell DVD Compare which release package you've selected.

#### EXAMPLE

```sh
yarn nameSpecialFeatures 'G:\Disc-Rips\Ford v Ferrari bonus' https://dvdcompare.net/comparisons/film.php?fid=52929#1
```

## Demo Media File Naming

Rename demo media files with the correct video and audio codecs used by inspecting each individual file.

This is useful when bringing down a load of demo files which may or may not be correctly named.

Demo files need their names done a certain way. Once that's done, this library can take over the rest.

Examples of demo filenames:

- Movie Demo ➡️ `Ford v Ferrari (2019) [1st Miles Race] {FHD 2.39 SDR & DTS-ES MA Matrix 6.1}`
- Movie Demo ➡️ `Ford v Ferrari (2019) [Broken Brakes] {4K HDR10 & Dolby Atmos TrueHD}`
- Music Video ➡️ `Pink Floyd - The Dark Side Of The Moon - Any Colour You Like {FHD SDR & Dolby Atmos TrueHD}`
- Music Video ➡️ `Queen - I Want It All {SD SDR & DTS 96-24 5.1}`
- Technology Demo ➡️ `[Dolby] Argon {SD SDR & Dolby Digital 5.1}`
- Technology Demo ➡️ `[LG] Cymatic Jazz {4K HLG & AAC 2.0}`

### Usage

```sh
yarn nameDemoFiles FOLDER_LOCATION
```

- `FOLDER_LOCATION`: The absolute path of the directory with your demo media.

#### EXAMPLE

```sh
yarn nameDemoFiles 'G:\Movie-Demos'
```
