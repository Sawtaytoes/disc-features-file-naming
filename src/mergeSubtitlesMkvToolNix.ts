import path, {
  dirname,
  join,
} from "node:path"
import {
  concatMap,
  endWith,
} from "rxjs";

import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { runMkvMerge } from "./runMkvMerge.js";
import {
  defineLanguageForUndefinedTracks,
} from "./defineLanguageForUndefinedTracks.js";

export const subtitledFolderName = "SUBTITLED"

export const fileExtensionsWithSubtitles = (
  new Set([
    ".ass",
    ".srt",
    ".ssa",
    ".sup",
  ])
)

export const mergeSubtitlesMkvToolNix = ({
  attachmentFilePaths,
  audioLanguage,
  destinationFilePath,
  chaptersFilePath,
  offsetInMilliseconds,
  subtitlesFilePath,
  subtitlesLanguage,
}: {
  attachmentFilePaths: string[],
  audioLanguage: Iso6392LanguageCode,
  destinationFilePath: string,
  chaptersFilePath: string,
  offsetInMilliseconds?: number,
  subtitlesFilePath: string,
  subtitlesLanguage: Iso6392LanguageCode,
}) => (
  runMkvMerge({
    args: [
      "--audio-tracks",
      audioLanguage,

      // "--subtitle-tracks",
      // subtitlesLanguage,
      "--no-subtitles",

      destinationFilePath,

      "--no-video",
      "--no-audio",
      "--no-chapters",
      "--no-buttons",
      "--no-global-tags",

      ...(
        offsetInMilliseconds
        ? [
          "--sync",
          `-1:${offsetInMilliseconds}`,
        ]
        : []
      ),

      subtitlesFilePath,

      ...(
        chaptersFilePath
        ? [
          "--chapters",
          chaptersFilePath,
        ]
        : []
      ),

      ...(
        (
          attachmentFilePaths
          || []
        )
        .flatMap((
          attachmentFilePath,
        ) => ([
          "--attach-file",
          attachmentFilePath,
        ]))
      ),
    ],
    outputFilePath: (
      destinationFilePath
      .replace(
        (
          dirname(
            destinationFilePath
          )
        ),
        (
          join(
            (
              dirname(
                destinationFilePath
              )
            ),
            subtitledFolderName,
          )
        ),
      )
    )
  })
  .pipe(
    concatMap(() => (
      defineLanguageForUndefinedTracks({
        filePath: (
          destinationFilePath
          .replace(
            (
              dirname(
                destinationFilePath
              )
            ),
            (
              join(
                (
                  dirname(
                    destinationFilePath
                  )
                ),
                subtitledFolderName,
              )
            ),
          )
        ),
        subtitleLanguage: subtitlesLanguage,
        trackType: "subtitles",
      })
      .pipe(
        // This would normally go to the next step in the pipeline, but there are sometimes no "und" language tracks, so we need to utilize this `endWith` to continue in the event the `filter` stopped us.
        endWith(
          null
        ),
      )
    )),
  )
)
