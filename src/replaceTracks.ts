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
import { getMediaInfo } from "./getMediaInfo.js"
import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { parseMediaFileChapterTimestamp } from "./parseTimestamps.js"
import { readFiles } from "./readFiles.js"
import { replaceTracksMkvToolNix } from "./replaceTracksMkvToolNix.js"

export const replaceTracks = ({
  audioLanguages,
  destinationFilesPath,
  globalOffsetInMilliseconds,
  hasAutomaticOffset,
  hasChapters,
  offsets,
  sourceFilesPath,
  subtitlesLanguages,
}: {
  audioLanguages: Iso6392LanguageCode[]
  destinationFilesPath: string
  globalOffsetInMilliseconds?: number
  hasAutomaticOffset: boolean
  hasChapters: boolean
  offsets: number[]
  sourceFilesPath: string
  subtitlesLanguages: Iso6392LanguageCode[]
}) => (
  readFiles({
    sourcePath: (
      sourceFilesPath
    ),
  })
  .pipe(
    concatMap((
      audioFiles,
    ) => (
      readFiles({
        sourcePath: (
          destinationFilesPath
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
        map((
          {
            destinationFilePath,
            mediaFileInfo,
            audioFilePath,
          },
          index,
        ) => (
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
              replaceTracksMkvToolNix({
                audioLanguages,
                destinationFilePath,
                hasChapters,
                offsetInMilliseconds: (
                  (
                    offsets
                    [index]
                  )
                  ?? (
                    offsetInMilliseconds
                  )
                ),
                sourceFilePath: audioFilePath,
                subtitlesLanguages,
              })
            )),
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED BETTER FILE]"
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
      replaceTracks
    ),
  )
)
