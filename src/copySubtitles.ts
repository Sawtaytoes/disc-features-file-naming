import {
  concatMap,
  endWith,
  filter,
  from,
} from "rxjs";

import { Iso6392LanguageCode } from "./Iso6392LanguageCode.js"
import { getMkvInfo } from "./getMkvInfo.js";
import { runMkvMerge } from "./runMkvMerge.js";
import { runMkvPropEdit } from "./runMkvPropEdit.js";

export const subtitledText = "[SUBTITLED]"

export const copySubtitles = ({
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
  getMkvInfo(
    sourceFilePath,
  )
  .pipe(
    concatMap(({
      tracks
    }) => (
      from(
        tracks
      )
      .pipe(
        filter((
          track,
        ) => (
          (
            track
            .type
          )
          === "subtitles"
        )),
        filter((
          track,
        ) => (
          (
            track
            .properties
            .language
          )
          === "und"
        )),
        concatMap((
          track,
        ) => (
          runMkvPropEdit({
            args: [
              "--edit",
              `track:@${track.properties.number}`,

              "--set",
              `language=${subtitleLanguage}`,
            ],
            filePath: sourceFilePath,
          })
        )),

        // This would normally go to the next `concatMap`, but there are sometimes no "und" language tracks, so we need to utilize this `endWith` to continue in the event the `filter`s stopped us.
        endWith(
          null
        ),
      )
    )),
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

          "--subtitle-tracks",
          subtitleLanguage,

          sourceFilePath,
        ],
        newFilePath: (
          destinationFilePath
          .replace(
            /(\..+)/,
            ` ${subtitledText}$1`,
          )
        )
      })
    )),
  )
)
