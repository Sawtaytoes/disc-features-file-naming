import chalk from "chalk"
import {
  concatAll,
  concatMap,
  filter,
  map,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { readFiles } from "./readFiles.js"
import { replaceAttachmentsMkvMerge } from "./replaceAttachmentsMkvMerge.js"

export const replaceAttachments = ({
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
      mediaFiles,
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
          destinationFilePath: (
            mediaFileInfo
            .fullPath
          ),
          mediaFileInfo,
          mediaFilePath: (
            (
              mediaFiles
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
        })),
        filter(({
          mediaFilePath,
        }) => (
          Boolean(
            mediaFilePath
          )
        )),
        map(({
          destinationFilePath,
          mediaFileInfo,
          mediaFilePath,
        }) => (
          replaceAttachmentsMkvMerge({
            destinationFilePath,
            sourceFilePath: mediaFilePath,
          })
          .pipe(
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED FILE WITH ATTACHMENTS]"
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
      replaceAttachments
    ),
  )
)
