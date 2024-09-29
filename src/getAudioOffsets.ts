import chalk from "chalk"
import {
  concatAll,
  concatMap,
  filter,
  map,
  of,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getAudioOffset } from "./getAudioOffset.js"
import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { readFiles } from "./readFiles.js"
import { replaceTracksMkvMerge } from "./replaceTracksMkvMerge.js"

export const getAudioOffsets = ({
  destinationFilesPath,
  sourceFilesPath,
}: {
  destinationFilesPath: string
  sourceFilesPath: string
}) => (
  readFiles({
    sourcePath: (
      sourceFilesPath
    ),
  })
  .pipe(
    concatMap((
      sourceFileInfos,
    ) => (
      readFiles({
        sourcePath: (
          destinationFilesPath
        ),
      })
      .pipe(
        concatAll(),
        map((
          destinationFileInfo,
        ) => ({
          destinationFilePath: (
            destinationFileInfo
            .fullPath
          ),
          sourceFilePath: (
            (
              sourceFileInfos
              .find((
                sourceFileInfo,
              ) => (
                (
                  sourceFileInfo
                  .filename
                )
                === (
                  destinationFileInfo
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
        concatMap((
          {
            destinationFilePath,
            sourceFilePath,
          },
        ) => (
          getAudioOffset({
            destinationFilePath,
            sourceFilePath,
          })
          .pipe(
            map((
              offsetInMilliseconds,
            ) => ({
              destinationFilePath,
              offsetInMilliseconds,
              sourceFilePath,
            })),
          )
        )),
        toArray(),
        concatAll(),
        tap(({
          destinationFilePath,
          offsetInMilliseconds,
          sourceFilePath,
        }) => {
          console
          .info(
            (
              chalk
              .green(
                "[OFFSET IN MILLISECONDS]"
              )
            ),
            offsetInMilliseconds,
            "\n",
            sourceFilePath,
            destinationFilePath,
            "\n",
            "\n",
          )
        }),
        toArray(),
        tap(() => {
          process
          .exit()
        })
      )
    )),
    catchNamedError(
      getAudioOffsets
    ),
  )
)
