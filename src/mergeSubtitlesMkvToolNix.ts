import {
  dirname,
  extname,
  join,
} from "node:path"
import {
  concatMap,
  endWith,
  of,
} from "rxjs";

import { type Iso6392LanguageCode } from "./Iso6392LanguageCode.js"
import { runMkvMerge } from "./runMkvMerge.js";
import {
  defineLanguageForUndefinedTracks,
} from "./defineLanguageForUndefinedTracks.js";

export const subtitledPath = "SUBTITLED"

export const fileExtensionsWithLanguages = (
  new Set([
    ".m2ts",
    ".mkv",
    ".mp4",
    ".ts",
  ])
)

export const mergeSubtitlesMkvToolNix = ({
  audioLanguage,
  destinationFilePath,
  offsetInMilliseconds,
  sourceFilePath,
  subtitleLanguage,
}: {
  audioLanguage: Iso6392LanguageCode,
  destinationFilePath: string,
  offsetInMilliseconds?: number,
  sourceFilePath: string,
  subtitleLanguage: Iso6392LanguageCode,
}) => (
  (
    (
      fileExtensionsWithLanguages
      .has(
        extname(
          sourceFilePath
        )
      )
    )
    ? (
      defineLanguageForUndefinedTracks({
        filePath: sourceFilePath,
        subtitleLanguage,
        trackType: "subtitles",
      })
      .pipe(
        // This would normally go to the next step in the pipeline, but there are sometimes no "und" language tracks, so we need to utilize this `endWith` to continue in the event the `filter` stopped us.
        endWith(
          null
        ),
      )
    )
    : (
      of(
        null
      )
    )
  )
  .pipe(
    concatMap(() => (
      runMkvMerge({
        args: [
          "--audio-tracks",
          audioLanguage,

          "--subtitle-tracks",
          subtitleLanguage,

          destinationFilePath,

          "--no-video",
          "--no-audio",
          "--no-buttons",
          "--no-chapters",
          "--no-global-tags",

          ...(
            offsetInMilliseconds
            ? [
              "--sync",
              `-1:${offsetInMilliseconds}`,
            ]
            : []
          ),

          ...(
            (
              fileExtensionsWithLanguages
              .has(
                extname(
                  sourceFilePath
                )
              )
            )
            ? [
              "--subtitle-tracks",
              subtitleLanguage,
            ]
            : []
          ),

          sourceFilePath,
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
                subtitledPath,
              )
            ),
          )
        )
      })
    )),
  )
)
