import chalk from "chalk"
import {
  EMPTY,
  combineLatest,
  concatAll,
  concatMap,
  filter,
  from,
  map,
  of,
  take,
  tap,
  toArray,
  zip,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { copySubtitlesMkvToolNix } from "./copySubtitlesMkvToolNix.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"

export const copySubtitles = ({
  globalOffsetInMilliseconds,
  hasAutomaticOffset,
  mediaFilesPath,
  subtitlesPath,
}: {
  globalOffsetInMilliseconds?: number
  hasAutomaticOffset: boolean
  mediaFilesPath: string
  subtitlesPath: string
}) => (
  readFiles({
    sourcePath: (
      subtitlesPath
    ),
  })
  .pipe(
    concatMap((
      subtitlesFiles,
    ) => (
      readFiles({
        sourcePath: (
          mediaFilesPath
        ),
      })
      .pipe(
        concatAll(),
        map((
          mediaFileInfo,
        ) => ({
          destinationFilePath: (
            mediaFileInfo
            .fullPath
          ),
          mediaFileInfo,
          subtitlesFilePath: (
            (
              subtitlesFiles
              .find((
                subtitlesFileInfo,
              ) => (
                (
                  subtitlesFileInfo
                  .filename
                )
                === (
                  mediaFileInfo
                  .filename
                )
              ))
              ?.fullPath
            )
            || ""
          ),
        })),
        filter(({
          subtitlesFilePath,
        }) => (
          Boolean(
            subtitlesFilePath
          )
        )),
        map(({
          destinationFilePath,
          mediaFileInfo,
          subtitlesFilePath,
        }) => (
          (
            hasAutomaticOffset
            ? (
              combineLatest([
                getMediaInfo(
                  subtitlesFilePath
                ),
                getMediaInfo(
                  destinationFilePath
                ),
              ])
              .pipe(
                concatAll(),
                map((
                  mediaInfo,
                ) => (
                  mediaInfo
                  ?.media
                  ?.track
                  .flatMap((
                    track,
                  ) => (
                    (
                      track
                      ["@type"]
                    )
                    === "Menu"
                  )
                  ? track
                  : []
                  )
                  .find(
                    Boolean
                  )
                  ?.extra
                )),
                filter(
                  Boolean
                ),
                map((
                  chapters,
                ) => (
                  Object
                  .keys(
                    chapters
                  )
                  .map((
                    chapterTimestamp,
                  ) => {
                    // Example: "_00_01_31_799"
                    const [
                      hours,
                      minutes,
                      seconds,
                      milliseconds,
                    ] = (
                      chapterTimestamp
                      .split("_")
                      .slice(1)
                      .map((
                        timeValue,
                      ) => (
                        Number(
                          timeValue
                          || ""
                        )
                      ))
                    )

                    return (
                      hours * 60 * 60
                      + minutes * 60
                      + seconds * 1000
                      + milliseconds
                    )
                  })
                )),
                toArray(),
                concatMap(([
                  sourceFileChapterTimestamps,
                  destinationFileChapterTimestamps,
                ]) => (
                  zip([
                    from(
                      sourceFileChapterTimestamps,
                    ),
                    from(
                      destinationFileChapterTimestamps
                    ),
                  ])
                )),
                concatMap(([
                  sourceFileChapterTimestamp,
                  destinationFileChapterTimestamp,
                ]) => {
                  const offsetInMilliseconds = (
                    destinationFileChapterTimestamp
                    - sourceFileChapterTimestamp
                  )

                  return (
                    (
                      offsetInMilliseconds
                      === 0
                    )
                    ? EMPTY
                    : (
                      of(
                        offsetInMilliseconds
                      )
                    )
                  )
                }),
                take(1),
              )
            )
            : (
              of(
                globalOffsetInMilliseconds
              )
            )
          )
          .pipe(
            concatMap((
              offsetInMilliseconds,
            ) => (
              copySubtitlesMkvToolNix({
                audioLanguage: "jpn",
                destinationFilePath,
                offsetInMilliseconds,
                sourceFilePath: subtitlesFilePath,
                subtitlesLanguage: "eng",
              })
            )),
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED SUBTITLED FILE]"
                  )
                ),
                (
                  mediaFileInfo
                  .fullPath
                ),
                "\n",
                "\n",
              )
            }),
            filter(
              Boolean
            ),
          )
        )),
        concatAll(),
        toArray(),
        tap(() => {
          process
          .exit()
        })
      )
    )),
    catchNamedError(
      copySubtitles
    ),
  )
)
