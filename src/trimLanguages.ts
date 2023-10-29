import chalk from "chalk"
import { rename } from "node:fs/promises"
import {
  filter,
  mergeAll,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import {
  keepSpecifiedLanguageTracks,
  languageTrimmedText,
} from "./keepSpecifiedLanguageTracks.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const trimLanguages = ({
  isRecursive,
  sourcePath,
}: {
  isRecursive: boolean,
  sourcePath: string
}) => (
  readFilesAtDepth({
    depth: (
      isRecursive
      ? 1
      : 0
    ),
    sourcePath,
  })
  .pipe(
    mergeAll(),
    filter((
      fileInfo,
    ) => (
      !(
        fileInfo
        .filename
        .includes(
          languageTrimmedText
        )
      )
    )),
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
    catchNamedError(
      trimLanguages
    )
  )
)
