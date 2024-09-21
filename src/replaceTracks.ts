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

export const replaceTracks = ({
  audioLanguages,
  destinationFilesPath,
  globalOffsetInMilliseconds,
  hasAutomaticOffset,
  hasChapters,
  offsets,
  sourceFilesPath,
  subtitlesLanguages,
  videoLanguages,
}: {
  audioLanguages: Iso6392LanguageCode[]
  destinationFilesPath: string
  globalOffsetInMilliseconds?: number
  hasAutomaticOffset: boolean
  hasChapters: boolean
  offsets: number[]
  sourceFilesPath: string
  subtitlesLanguages: Iso6392LanguageCode[]
  videoLanguages: Iso6392LanguageCode[]
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
          destinationFileInfo,
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
            destinationFileInfo,
            sourceFilePath,
          },
          index,
        ) => (
          (
            hasAutomaticOffset
            ? (
              getAudioOffset({
                destinationFilePath,
                sourceFilePath,
              })
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
              replaceTracksMkvMerge({
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
                sourceFilePath,
                subtitlesLanguages,
                videoLanguages,
              })
            )),
            tap((
              outputFilePath,
            ) => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED BETTER FILE]"
                  )
                ),
                outputFilePath,
                "\n",
                "\n",
              )
            }),
            filter(
              Boolean
            ),
          )
        )),
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
