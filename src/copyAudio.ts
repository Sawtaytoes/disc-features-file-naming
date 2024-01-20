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
import { copyAudioMkvToolNix } from "./copyAudioMkvToolNix.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { parseMediaFileChapterTimestamp } from "./parseTimestamps.js"
import { readFiles } from "./readFiles.js"

export const copyAudio = ({
  audioLanguages,
  audioPath,
  globalOffsetInMilliseconds,
  hasAutomaticOffset,
  mediaFilesPath,
}: {
  audioLanguages: Iso6392LanguageCode[]
  audioPath: string
  globalOffsetInMilliseconds?: number
  hasAutomaticOffset: boolean
  mediaFilesPath: string
}) => (
  readFiles({
    sourcePath: (
      audioPath
    ),
  })
  .pipe(
    concatMap((
      audioFiles,
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
          audioFilePath: (
            (
              audioFiles
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
          destinationFilePath: (
            mediaFileInfo
            .fullPath
          ),
          mediaFileInfo,
        })),
        filter(({
          audioFilePath,
        }) => (
          Boolean(
            audioFilePath
          )
        )),
        map(({
          destinationFilePath,
          mediaFileInfo,
          audioFilePath,
        }) => (
          (
            hasAutomaticOffset
            ? (
              combineLatest([
                (
                  getMediaInfo(
                    audioFilePath
                  )
                ),
                (
                  getMediaInfo(
                    destinationFilePath
                  )
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
                  ) => (
                    parseMediaFileChapterTimestamp(
                      chapterTimestamp
                    )
                  ))
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
              copyAudioMkvToolNix({
                audioLanguages,
                destinationFilePath,
                offsetInMilliseconds,
                sourceFilePath: audioFilePath,
              })
            )),
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED BETTER AUDIO FILE]"
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
      copyAudio
    ),
  )
)
