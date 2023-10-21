import "@total-typescript/ts-reset"
import "dotenv/config"

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
import { copySubtitles } from "./copySubtitles.js"
import { getArgValues } from "./getArgValues.js"
import { readFiles } from "./readFiles.js"
import { getMediaInfo } from "./getMediaInfo.js"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)

const {
  destinationDirectory,
  globalOffsetInMilliseconds,
  sourceDirectory,
} = (
  getArgValues()
)

export const addSubtitles = () => (
  readFiles({
    parentDirectory: (
      sourceDirectory
    ),
  })
  .pipe(
    concatMap((
      sourceDirectoryFiles,
    ) => (
      readFiles({
        parentDirectory: (
          destinationDirectory
        ),
      })
      .pipe(
        concatAll(),
        map((
          fileInfo,
        ) => ({
          destinationFilePath: (
            fileInfo
            .fullPath
          ),
          fileInfo,
          sourceFilePath: (
            (
              sourceDirectoryFiles
              .find((
                sourceFileInfo,
              ) => (
                (
                  sourceFileInfo
                  .filename
                )
                === (
                  fileInfo
                  .filename
                )
              ))
              ?.fullPath
            )
            || ""
          ),
        })),
        filter(({
          sourceFilePath,
        }) => (
          Boolean(
            sourceFilePath
          )
        )),
        map(({
          destinationFilePath,
          fileInfo,
          sourceFilePath,
        }) => (
          (
            (
              globalOffsetInMilliseconds
              === "automatic"
            )
            ? (
              combineLatest([
                getMediaInfo(
                  sourceFilePath
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
              copySubtitles({
                audioLanguage: "jpn",
                destinationFilePath,
                offsetInMilliseconds,
                sourceFilePath,
                subtitleLanguage: "eng",
              })
            )),
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[SWAPPING IN SUBTITLED FILE]"
                  )
                ),
                (
                  fileInfo
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
      addSubtitles
    )
  )
)

addSubtitles()
.subscribe()
