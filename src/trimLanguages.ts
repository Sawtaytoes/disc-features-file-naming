import chalk from "chalk"
import {
  concatAll,
  filter,
  map,
  mergeAll,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import {
  keepSpecifiedLanguageTracks,
  languageTrimmedFolderName,
} from "./keepSpecifiedLanguageTracks.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"
import { Iso6392LanguageCode } from "./iso6392LanguageCodes.js"

/** @experimental Untested and has some missing features. */
export const trimLanguages = ({
  audioLanguages,
  isRecursive,
  sourcePath,
  subtitlesLanguages,
}: {
  audioLanguages: Iso6392LanguageCode[],
  isRecursive: boolean
  sourcePath: string
  subtitlesLanguages: Iso6392LanguageCode[],
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
        .fullPath
        .includes(
          languageTrimmedFolderName
        )
      )
    )),
    map((
      fileInfo,
    ) => (
      // TODO: Before doing this, figure out what tracks exist. If no audio tracks of the given language, we probably shouldn't touch the file.

      // TODO: If the selected Language is already first and the default, don't bother changing it.

      keepSpecifiedLanguageTracks({
        audioLanguages,
        filePath: (
          fileInfo
          .fullPath
        ),
        subtitlesLanguages,
      })
      .pipe(
        tap(() => {
          console
          .info(
            (
              chalk
              .green(
                "[CREATED TRIMMED FILE]"
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
    }),
    catchNamedError(
      trimLanguages
    )
  )
)
