import "dotenv/config"

import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { changeTrackLanguages } from "./changeTrackLanguages.js"
import { hasBetterAudio } from "./hasBetterAudio.js"
import { hasBetterVersion } from "./hasBetterVersion.js"
import { hasImaxEnhancedAudio } from "./hasImaxEnhancedAudio.js"
import { hasManyAudioTracks } from "./hasManyAudioTracks.js"
import { isMissingSubtitles } from "./isMissingSubtitles.js"
import {
  iso6392LanguageCodes,
  type Iso6392LanguageCode,
} from "./iso6392LanguageCodes.js"
import { keepLanguages } from "./keepLanguages.js"
import { mergeTracks } from "./mergeTracks.js"
import { nameAnimeEpisodes } from "./nameAnimeEpisodes.js"
import { nameSpecialFeatures } from "./nameSpecialFeatures.js"
import { nameTvShowEpisodes } from "./nameTvShowEpisodes.js"
import { renameDemos } from "./renameDemos.js"
import { renameMovieDemoDownloads } from "./renameMovieDemoDownloads.js"
import { reorderTracks } from "./reorderTracks.js"
import { replaceFlacWithPcmAudio } from "./replaceFlacWithPcmAudio.js"
import { replaceTracks } from "./replaceTracks.js"
import { splitChapters } from "./splitChapters.js"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)

yargs(
  hideBin(
    process
    .argv
  )
)
.scriptName(
  "media"
)
.wrap(
  process
  .stdout
  .columns
)
.usage(
  "Usage: $0 <cmd> [args]"
)
.command(
  "changeTrackLanguages <sourcePath>",
  "Change the language of all video, audio, or subtitles tracks. This is useful when your media files had the wrong language set. For example, if the English subtitles track was listed as Japanese because it translates the Japanese audio.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 changeTrackLanguages \"G:\\Anime\\dot.hack--SIGN\" --subs-lang eng",
      "This changes the subtitles language to English where it was incorrectly set to Japanese. This is best used after removing subtitle languages you don't want as it sets all subtitles tracks to English."
    )
    .example(
      "$0 changeTrackLanguages \"G:\\Anime\\Code Geass\" --audio-lang jpn",
      "Changes the audio language to Japanese where it may have been missing (set as undefined). This can be powerful when used with the keepLanguages command."
    )
    .example(
      "$0 changeTrackLanguages \"G:\\Movies\\Osmosis Jones\" --video-lang eng",
      "Pretty much every media file will have the video language set to English even if it's a foreign media file. In some cases this language is undefined, so you may want to change it back to English. It's also possible you want to set the video language based on the content for better searching and sorting."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory with containing media files with tracks you want to copy.",
        type: "string",
      },
    )
    .option(
      "audioLanguage",
      {
        alias: "audio-lang",
        choices: iso6392LanguageCodes,
        describe: "A 3-letter ISO-6392 language code for audio tracks to keep. All others will be removed",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "subtitlesLanguage",
      {
        alias: "subs-lang",
        choices: iso6392LanguageCodes,
        describe: "A 3-letter ISO-6392 language code for subtitles tracks to keep. All others will be removed",
        type: "string",
      },
    )
    .option(
      "videoLanguage",
      {
        alias: "video-lang",
        choices: iso6392LanguageCodes,
        describe: "A 3-letter ISO-6392 language code for subtitles tracks to keep. All others will be removed",
        type: "string",
      },
    )
  ),
  (argv) => {
    changeTrackLanguages({
      audioLanguage: (
        argv
        .audioLanguage
      ),
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
      subtitlesLanguage: (
        argv
        .subtitlesLanguage
      ),
      videoLanguage: (
        argv
        .videoLanguage
      ),
    })
    .subscribe()
  }
)
.command(
  "hasBetterAudio <sourcePath>",
  "Output a list of files that have a higher channel count audio track not listed as the first one.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 hasBetterAudio \"~/movies\" -r",
      "Recursively looks through all folders in '~/movies' where higher channel count audio tracks aren't the default."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory containing media files or containing other directories of media files.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    hasBetterAudio({
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "hasBetterVersion <sourcePath>",
  "Output a list of Ultra HD Blu-ray releases where a better version is available along with a reason. This information comes from a thread on criterionforum.org.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 hasBetterVersion \"~/movies\" -r",
      "Recursively looks through all folders in '~/movies' where a better version is available noted on a criterionforum.org thread."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory containing media files or containing other directories of media files.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    hasBetterVersion({
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "hasImaxEnhancedAudio <sourcePath>",
  "Lists any files with an IMAX Enhanced audio track. Useful for checking movies and demos.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 hasImaxEnhancedAudio \"~/demos\"",
      "Lists any media files in '~/demos' with at least one IMAX Enhanced audio track."
    )
    .example(
      "$0 hasImaxEnhancedAudio \"~/movies\" -r",
      "Recursively goes through '~/movies', and lists any media files with at least one IMAX Enhanced audio track."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory containing media files or containing other directories of media files.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    hasImaxEnhancedAudio({
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "hasManyAudioTracks <sourcePath>",
  "Lists any files that have more than one audio track. Useful for determining which demo files may have unused audio tracks.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 hasManyAudioTracks \"~/demos\"",
      "Lists any media files in '~/demos' with more than 1 audio track."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory containing media files or containing other directories of media files.",
        type: "string",
      },
    )
  ),
  (argv) => {
    hasManyAudioTracks({
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "isMissingSubtitles <sourcePath>",
  "Lists all folders and files where subtitles are missing. This is useful when you have a lot of media in a different language and may need to add subtitles.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 isMissingSubtitles \"~/code geass\"",
      "Looks through all media files in '~/code geass' and notes any that are missing subtitles."
    )
    .example(
      "$0 isMissingSubtitles \"~/anime\" -r",
      "Recursively Looks through all media files in '~/anime' and notes any that are missing subtitles."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory containing media files or containing other directories of media files.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    isMissingSubtitles({
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "keepLanguages <sourcePath>",
  "Keeps only the specified audio and subtitle languages.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 keepLanguages \"~/movies\" -r --firstAudio --firstSubtitles",
      "Recursively looks through media files and only keeps the audio tracks matching the first audio track's language and only subtitles tracks matching the first subtitles track's language."
    )
    .example(
      "$0 keepLanguages \"~/movies\" -r --firstAudio --audio-lang eng --firstSubtitles",
      "Recursively looks through media files and only keeps the audio tracks matching the first audio track's language as well as the specified audio language and only subtitles tracks matching the first subtitles track's language. This is useful when movies are in another language, but have english commentary."
    )
    .example(
      "$0 keepLanguages \"~/anime\" -r --audio-lang jpn --audio-lang eng --subs-lang eng",
      "Recursively looks through media files and only keeps Japanese and English audio and English subtitles tracks."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where demo files are located.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "audioLanguages",
      {
        alias: "audio-lang",
        array: true,
        choices: iso6392LanguageCodes,
        default: [] satisfies Iso6392LanguageCode[],
        describe: "A 3-letter ISO-6392 language code for audio tracks to keep. All others will be removed",
        type: "array",
      },
    )
    .option(
      "useFirstAudioLanguage",
      {
        alias: "firstAudio",
        boolean: true,
        default: false,
        describe: "The language of the first audio track is the only language kept for audio tracks.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "subtitlesLanguages",
      {
        alias: "subs-lang",
        array: true,
        choices: iso6392LanguageCodes,
        default: [] satisfies Iso6392LanguageCode[],
        describe: "A 3-letter ISO-6392 language code for subtitles tracks to keep. All others will be removed",
        type: "array",
      },
    )
    .option(
      "useFirstSubtitlesLanguage",
      {
        alias: "firstSubtitles",
        boolean: true,
        default: false,
        describe: "The language of the first subtitles track is the only language kept for subtitles tracks.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    keepLanguages({
      audioLanguages: (
        argv
        .audioLanguages
      ),
      hasFirstAudioLanguage: (
        argv
        .useFirstAudioLanguage
      ),
      hasFirstSubtitlesLanguage: (
        argv
        .useFirstSubtitlesLanguage
      ),
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
      subtitlesLanguages: (
        argv
        .subtitlesLanguages
      ),
    })
    .subscribe()
  }
)
.command(
  "mergeTracks <subtitlesPath> <mediaFilesPath>",
  "Merge subtitles files with media files and only keep specified languages.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 mergeTracks \"G:\\Anime\\Code Geass Subs\" \"G:\\Anime\\Code Geass\"",
      "Adds subtitles to all media files with a corresponding folder in the subs folder that shares the exact same name (minus the extension)."
    )
    .positional(
      "subtitlesPath",
      {
        demandOption: true,
        describe: "Directory containing subdirectories with subtitle files and `attachments/` that match the name of the media files in `mediaFilesPath`.",
        type: "string",
      },
    )
    .positional(
      "mediaFilesPath",
      {
        demandOption: true,
        describe: "Directory with media files that need subtitles.",
        type: "string",
      },
    )
    .option(
      "automaticOffset",
      {
        alias: "a",
        default: false,
        describe: "Calculate subtitle offsets for each file using differences in chapter markers.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "includeChapters",
      {
        alias: "c",
        default: false,
        describe: "Adds chapters along with audio tracks.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    mergeTracks({
      hasAutomaticOffset: (
        argv
        .automaticOffset
      ),
      hasChapters: (
        argv
        .includeChapters
      ),
      mediaFilesPath: (
        argv
        .mediaFilesPath
      ),
      subtitlesPath: (
        argv
        .subtitlesPath
      ),
    })
    .subscribe()
  }
)
.command(
  "nameAnimeEpisodes <sourcePath> <searchTerm>",
  "Name all anime episodes in a directory according to episode names on MyAnimeList.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 nameAnimeEpisodes \"~/anime\" \"psycho-pass\"",
      "Names all video files in '~/anime' based on the episode names on MyAnimeList."
    )
    .option(
      "seasonNumber",
      {
        alias: "s",
        default: 1,
        describe: "The season number to output when renaming useful for TVDB which has separate season number. For aniDB, use the default value 1.",
        nargs: 1,
        number: true,
        type: "number",
      },
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where all episodes for that season are located.",
        type: "string",
      },
    )
    .positional(
      "searchTerm",
      {
        demandOption: true,
        describe: "Name of the anime for searching MyAnimeList.com.",
        type: "string",
      },
    )
  ),
  (argv) => {
    nameAnimeEpisodes({
      searchTerm: (
        argv
        .searchTerm
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
      seasonNumber: (
        argv
        .seasonNumber
      ),
    })
    .subscribe()
  }
)
.command(
  "nameSpecialFeatures <sourcePath> <url>",
  "Name all special features in a directory according to a DVDCompare.net URL.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 nameSpecialFeatures \"~/disc-rips/movieName\" \"https://dvdcompare.net/comparisons/film.php?fid=55539#1\"",
      "Names all special features in the movie folder using the DVDCompare.net release at `#1`."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where speical features are located.",
        type: "string",
      },
    )
    .positional(
      "url",
      {
        demandOption: true,
        describe: "DVDCompare.net URL including the chosen release's hash tag.",
        type: "string",
      },
    )
  ),
  (argv) => {
    nameSpecialFeatures({
      sourcePath: (
        argv
        .sourcePath
      ),
      url: (
        argv
        .url
      ),
    })
    .subscribe()
  }
)
.command(
  "nameTvShowEpisodes <sourcePath> <searchTerm>",
  "Name all TV show episodes in a directory according to episode names on TVDB.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 nameTvShowEpisodes \"~/shows\" \"beast wars\"",
      "Names all video files in '~/shows' based on the episode names on TVDB."
    )
    .option(
      "seasonNumber",
      {
        alias: "s",
        demandOption: true,
        describe: "The season number to lookup when renaming.",
        nargs: 1,
        number: true,
        type: "number",
      },
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where all episodes for that season are located.",
        type: "string",
      },
    )
    .positional(
      "searchTerm",
      {
        demandOption: true,
        describe: "Name of the TV show for searching TVDB.com.",
        type: "string",
      },
    )
  ),
  (argv) => {
    nameTvShowEpisodes({
      searchTerm: (
        argv
        .searchTerm
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
      seasonNumber: (
        argv
        .seasonNumber
      ),
    })
    .subscribe()
  }
)
.command(
  "renameMovieDemoDownloads <sourcePath>",
  "Rename TomSawyer's movie rips from the AVSForums to follow the demo format.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 renameMovieDemoDownloads \"~/movie-demos\"",
      "Renames all video files in '~/movie-demos' based the demo format for renaming with other commands."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where downloaded movie demos are located.",
        type: "string",
      },
    )
  ),
  (argv) => {
    renameMovieDemoDownloads({
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "renameDemos <sourcePath>",
  "Rename demo files (such as Dolby's Amaze) to a format which accurately states all capabilities for easier searching and sorting in media apps (like Plex).",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 renameDemos \"~/demos\"",
      "Renames all video files in '~/demos' with the correct media information. This will also replace incorrect information."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where demo files are located.",
        type: "string",
      },
    )
  ),
  (argv) => {
    renameDemos({
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "reorderTracks <sourcePath>",
  "Swap the order of tracks. This is especially helpful when watching media files in a different language, and the translated subtitles track is the second one.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 reorderTracks \"G:\\Anime\\dot.hack--SIGN\" -s 1 0",
      "This reorders subtitles track 2 to position 1."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory with containing media files with tracks you want to copy.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "audioTrackIndexes",
      {
        alias: "a",
        array: true,
        describe: "The order of all audio tracks that will appear in the resulting file by their index. Indexes start at `0`. If you leave out any track indexes, they will not appear in the resulting file.",
        default: [] as number[],
        type: "string",
      },
    )
    .option(
      "subtitlesTrackIndexes",
      {
        alias: "s",
        array: true,
        describe: "The order of all subtitles tracks that will appear in the resulting file by their index. Indexes start at `0`. If you leave out any track indexes, they will not appear in the resulting file.",
        default: [] as number[],
        type: "string",
      },
    )
    .option(
      "videoTrackIndexes",
      {
        alias: "v",
        array: true,
        describe: "The order of all video tracks that will appear in the resulting file by their index. Indexes start at `0`. If you leave out any track indexes, they will not appear in the resulting file.",
        default: [] as number[],
        type: "string",
      },
    )
  ),
  (argv) => {
    reorderTracks({
      audioTrackIndexes: (
        argv
        .audioTrackIndexes
        .map((
          value,
        ) => (
          Number(
            value
          )
        ))
      ),
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
      subtitlesTrackIndexes: (
        argv
        .subtitlesTrackIndexes
        .map((
          value,
        ) => (
          Number(
            value
          )
        ))
      ),
      videoTrackIndexes: (
        argv
        .videoTrackIndexes
        .map((
          value,
        ) => (
          Number(
            value
          )
        ))
      ),
    })
    .subscribe()
  }
)
.command(
  "replaceFlacWithPcmAudio <sourcePath>",
  "Converts any FLAC audio tracks in media files to PCM tracks at the same bit depth. This is especially useful when you might have acquired a copy of media that came with FLAC audio and want PCM audio for compatibility with your home theater system.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 replaceFlacWithPcmAudio \"~/anime\"",
      "Replaces FLAC audio tracks in media files with a PCM conversion in '~/anime'."
    )
    .example(
      "$0 replaceFlacWithPcmAudio \"~/anime\" -r",
      "Recursively replaces FLAC audio tracks in media files with a PCM conversion in '~/anime'."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory containing media files or containing other directories of media files.",
        type: "string",
      },
    )
    .option(
      "isRecursive",
      {
        alias: "r",
        boolean: true,
        default: false,
        describe: "Recursively looks in folders for media files.",
        nargs: 0,
        type: "boolean",
      },
    )
  ),
  (argv) => {
    replaceFlacWithPcmAudio({
      isRecursive: (
        argv
        .isRecursive
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.command(
  "replaceTracks <sourceFilesPath> <destinationFilesPath> [offsets...]",
  "Copy tracks from one media file and replace them in another making sure to only keep the chosen languages.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 replaceTracks \"G:\\Anime\\Code Geass Good Audio\" \"G:\\Anime\\Code Geass Bad Audio\" -audio-lang jpn",
      "For all media files that have matching names (minus the extension), it replaces the bad audio media file's audio tracks with Japanese audio tracks from the good audio media file."
    )
    .example(
      "$0 replaceTracks \"G:\\Anime\\Code Geass Good Audio\" \"G:\\Anime\\Code Geass Bad Audio\" -audio-lang jpn 0.3 0.8 0.8 0.8 0.75",
      "For all media files that have matching names (minus the extension), it replaces the bad audio media file's audio tracks with Japanese audio tracks from the good audio media file and time-aligns them by the following values in file alphabetical order: 0.3, 0.8, 0.8, 0.8, 0.75."
    )
    .example(
      "$0 replaceTracks \"G:\\Anime\\Code Geass Subbed\" \"G:\\Anime\\Code Geass Unsubbed\" -subs-lang eng",
      "For all media files that have matching names (minus the extension), it replaces the unsubbed media file's subtitles with English subtitles from the subbed media file."
    )
    .example(
      "$0 replaceTracks \"G:\\Anime\\Code Geass with Chapters\" \"G:\\Anime\\Code Geass missing Chapters\" -c",
      "For all media files that have matching names (minus the extension), it adds chapters to the media files missing them."
    )
    .positional(
      "sourceFilesPath",
      {
        demandOption: true,
        describe: "Directory with containing media files with tracks you want to copy.",
        type: "string",
      },
    )
    .positional(
      "destinationFilesPath",
      {
        demandOption: true,
        describe: "Directory containing media files with tracks you want to replace.",
        type: "string",
      },
    )
    .positional(
      "offsets",
      {
        array: true,
        demandOption: false,
        describe: "Space-separated list of time-alignment offsets to set for each individual file in milliseconds.",
        default: [] satisfies number[],
        type: "string",
      },
    )
    .option(
      "audioLanguages",
      {
        alias: "audio-lang",
        array: true,
        choices: iso6392LanguageCodes,
        default: [] satisfies Iso6392LanguageCode[],
        describe: "A 3-letter ISO-6392 language code for audio tracks to keep. All others will be removed",
        type: "array",
      },
    )
    .option(
      "automaticOffset",
      {
        alias: "a",
        default: false,
        describe: "Calculate subtitle offsets for each file using differences in chapter markers.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "globalOffset",
      {
        alias: "o",
        default: 0,
        describe: "The offset in milliseconds to apply to all audio being transferred.",
        nargs: 1,
        number: true,
        type: "number",
      },
    )
    .option(
      "includeChapters",
      {
        alias: "c",
        default: false,
        describe: "Adds chapters along with audio tracks.",
        nargs: 0,
        type: "boolean",
      },
    )
    .option(
      "subtitlesLanguages",
      {
        alias: "subs-lang",
        array: true,
        choices: iso6392LanguageCodes,
        default: [] satisfies Iso6392LanguageCode[],
        describe: "A 3-letter ISO-6392 language code for subtitles tracks to keep. All others will be removed",
        type: "array",
      },
    )
  ),
  (argv) => {
    replaceTracks({
      audioLanguages: (
        argv
        .audioLanguages
      ),
      destinationFilesPath: (
        argv
        .destinationFilesPath
      ),
      globalOffsetInMilliseconds: (
        argv
        .globalOffset
      ),
      hasAutomaticOffset: (
        argv
        .automaticOffset
      ),
      hasChapters: (
        argv
        .includeChapters
      ),
      offsets: (
        argv
        .offsets
        .map((
          offset
        ) => (
          Number(
            offset
          )
        ))
      ),
      sourceFilesPath: (
        argv
        .sourceFilesPath
      ),
      subtitlesLanguages: (
        argv
        .subtitlesLanguages
      ),
    })
    .subscribe()
  }
)
.command(
  "splitChapters <sourcePath> <chapterSplits...>",
  "Breaks apart large video files based on chapter markers. The split occurs at the beginning of the given chapters. This is useful for anime discs which typically rip 4-6 episodes into a single large file.",
  (
    yargs,
  ) => (
    yargs
    .example(
      "$0 splitChapters \"~/disc-rips/gintama\" 7,18,26,33 6,17,25 6",
      "Breaks apart video files in '~/disc-rips/gintama' using the comma-separated chapter splits in filename order. Splits occur at the beginning of the given chapters."
    )
    .positional(
      "sourcePath",
      {
        demandOption: true,
        describe: "Directory where video files are located.",
        type: "string",
      },
    )
    .positional(
      "chapterSplits",
      {
        array: true,
        demandOption: true,
        describe: "Space-separated list of comma-separated chapter markers. Splits occur at the beginning of the chapter.",
        type: "string",
      },
    )
  ),
  (argv) => {
    splitChapters({
      chapterSplitsList: (
        argv
        .chapterSplits
      ),
      sourcePath: (
        argv
        .sourcePath
      ),
    })
    .subscribe()
  }
)
.strict()
.argv
