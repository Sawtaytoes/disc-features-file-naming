import "@total-typescript/ts-reset"
import "dotenv/config"

import chalk from "chalk"
import { rename, unlink } from "node:fs/promises"
import {
  from,
  mergeAll,
  mergeMap,
  take,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { keepSpecifiedLanguageTracks } from "./keepSpecifiedLanguageTracks.js"
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
  parentDirectory,
} = (
  getArgValues()
)

export const trimLanguages = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    mergeAll(),
    take(1),
    mergeMap((
      fileInfo,
    ) => (
      // TODO: before doing this, figure out what tracks exist. If no English tracks, we probably shouldn't touch the file.

      // TODO: We should make sure Japanese anime aren't touched as we don't want to remove the Japanese audio.

      keepSpecifiedLanguageTracks({
        audioLanguage: "eng",
        filePath: (
          fileInfo
          .fullPath
        ),
        subtitleLanguage: "eng",
      })
      .pipe(
        tap(() => {
          console
          .info(
            (
              chalk
              .green(
                "[SWAPPING IN TRIMMED FILE]"
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
        mergeMap((
          newFilePath,
        ) => (
          from(
            unlink(
              fileInfo
              .fullPath
            )
          )
          .pipe(
            mergeMap(() => (
              rename(
                newFilePath,
                (
                  fileInfo
                  .fullPath
                ),
              )
            ))
          )
        )),
      )
    )),
    catchNamedError(
      trimLanguages
    )
  )
)

trimLanguages()
.subscribe()
