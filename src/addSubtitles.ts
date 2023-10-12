import "@total-typescript/ts-reset"
import "dotenv/config"

import chalk from "chalk"
import { rename } from "node:fs/promises"
import {
  concatAll,
  concatMap,
  filter,
  map,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { copySubtitles } from "./copySubtitles.js"
import { getArgValues } from "./getArgValues.js"
import { readFiles } from "./readFiles.js"

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
        concatAll(
          4
        ),
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
        mergeMap(({
          destinationFilePath,
          fileInfo,
          sourceFilePath,
        }) => (
          copySubtitles({
            destinationFilePath,
            sourceFilePath,
            subtitleLanguage: "eng",
          })
          .pipe(
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
            mergeMap((
              newFilePath,
            ) => (
              rename(
                newFilePath,
                (
                  fileInfo
                  .fullPath
                ),
              )
            )),
          )
        )),
      )
    )),
    catchNamedError(
      addSubtitles
    )
  )
)

addSubtitles()
.subscribe()
