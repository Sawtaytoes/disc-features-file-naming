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
import { videoFileExtensions } from "./videoFileExtensions.js";

export const subtitledPath = "SUBTITLED"

export const copySubtitlesMkvToolNix = ({
  audioLanguage,
  destinationFilePath,
  offsetInMilliseconds,
  sourceFilePath,
  subtitlesLanguage,
}: {
  audioLanguage: Iso6392LanguageCode,
  destinationFilePath: string,
  offsetInMilliseconds?: number,
  sourceFilePath: string,
  subtitlesLanguage: Iso6392LanguageCode,
}) => (
  (
    (
      videoFileExtensions
      .has(
        extname(
          sourceFilePath
        )
      )
    )
    ? (
      defineLanguageForUndefinedTracks({
        filePath: sourceFilePath,
        subtitleLanguage: subtitlesLanguage,
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
          subtitlesLanguage,

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
              videoFileExtensions
              .has(
                extname(
                  sourceFilePath
                )
              )
            )
            ? [
              "--subtitle-tracks",
              subtitlesLanguage,
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
