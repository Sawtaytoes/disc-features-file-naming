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
      // TODO: before doing this, figure out what tracks exist. If no English tracks, we probably shouldn't touch the file.

      // TODO: We should make sure Japanese anime aren't touched as we don't want to remove the Japanese audio.

      keepSpecifiedLanguageTracks({
        audioLanguages: audioLanguages,
        filePath: (
          fileInfo
          .fullPath
        ),
        subtitlesLanguages: subtitlesLanguages,
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
