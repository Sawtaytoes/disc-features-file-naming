import {
  concatMap,
  endWith,
  filter,
  from,
  tap,
} from "rxjs";
import { Iso6392LanguageCode } from "./Iso6392LanguageCode.js"
import { getMkvInfo } from "./getMkvInfo.js";
import { runMkvMerge } from "./runMkvMerge.js";
import { runMkvPropEdit } from "./runMkvPropEdit.js";

export const subtitledText = "[SUBTITLED]"

export const copySubtitles = ({
  destinationFilePath,
  sourceFilePath,
  subtitleLanguage,
}: {
  destinationFilePath: string,
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
        endWith(
          null
        ),
      )
    )),
    concatMap(() => (
      runMkvMerge({
        args: [
          destinationFilePath,

          "--no-video",
          "--no-audio",
          "--no-buttons",
          "--no-chapters",
          "--no-global-tags",
          "--no-track-tags",

          "--subtitle-tracks",
          subtitleLanguage,

          sourceFilePath,
        ],
        newFilePath: (
          destinationFilePath
          .replace(
            /(\.(.+))/,
            ` ${subtitledText}$1`
          )
        )
      })
    )),
  )
)
