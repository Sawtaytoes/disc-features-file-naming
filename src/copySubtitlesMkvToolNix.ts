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

import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { runMkvMerge } from "./runMkvMerge.js";
import {
  defineLanguageForUndefinedTracks,
} from "./defineLanguageForUndefinedTracks.js";
import { getIsVideoFile } from "./getIsVideoFile.js";

export const subtitledFolderName = "SUBTITLED"

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
      getIsVideoFile(
        sourceFilePath,
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
              getIsVideoFile(
                sourceFilePath
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
                subtitledFolderName,
              )
            ),
          )
        )
      })
    )),
  )
)
