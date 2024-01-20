import {
  dirname,
  join,
} from "node:path"
import {
  concatMap,
  endWith,
  of,
} from "rxjs";

import { getIsVideoFile } from "./getIsVideoFile.js";
import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { runMkvMerge } from "./runMkvMerge.js";

export const betterAudioFolderName = "BETTER-AUDIO"

export const replaceAudioTracksMkvToolNix = ({
  audioLanguages,
  destinationFilePath,
  hasChapters,
  offsetInMilliseconds,
  sourceFilePath,
}: {
  audioLanguages: Iso6392LanguageCode[]
  destinationFilePath: string
  hasChapters: boolean
  offsetInMilliseconds?: number
  sourceFilePath: string
}) => (
  (
    (
      getIsVideoFile(
        sourceFilePath,
      )
    )
    ? (
      of(
        null
      )
      .pipe(
        // This would normally go to the next step in the pipeline, but there are sometimes no "und" language tracks, so we need to utilize this `endWith` to continue in the event the `filter` stopped us.
        endWith(
          null
        ),
        concatMap(() => (
          runMkvMerge({
            args: [
              "--no-audio",

              destinationFilePath,

              "--no-buttons",
              "--no-global-tags",
              "--no-subtitles",
              "--no-video",

              ...(
                hasChapters
                ? []
                : ["--no-chapters"]
              ),

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
                  "--audio-tracks",
                  (
                    audioLanguages
                    .join(",")
                  ),
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
                    betterAudioFolderName,
                  )
                ),
              )
            )
          })
        )),
      )
    )
    : (
      of(
        null
      )
    )
  )
)
