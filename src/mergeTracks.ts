import "@total-typescript/ts-reset"
import "dotenv/config"

import chalk from "chalk"
import {
  access,
  mkdir,
  stat,
} from "node:fs/promises"
import { join } from "node:path"
import {
  EMPTY,
  catchError,
  combineLatest,
  concatAll,
  concatMap,
  filter,
  from,
  map,
  merge,
  of,
  take,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import {
  mergeTracksFfmpeg,
  mergedPath,
} from "./mergeTracksFfmpeg.js"
import { readFiles } from "./readFiles.js"
import { readFolders } from "./readFolders.js"

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
  // globalOffsetInMilliseconds,
  sourceDirectory,
} = (
  getArgValues()
)

export const mergeTracks = () => (
  combineLatest([
    (
      readFolders({
        parentDirectory: (
          sourceDirectory
        ),
      })
    ),
    (
      readFiles({
        parentDirectory: (
          destinationDirectory
        ),
      })
    ),
    (
      from(
        access(
          join(
            destinationDirectory,
            mergedPath,
          )
        )
      )
      .pipe(
        concatMap(() => (
          mkdir(
            join(
              destinationDirectory,
              mergedPath,
            )
          )
        )),
        catchError(() => (
          of(
            null
          )
        )),
      )
    ),
  ])
  .pipe(
    concatMap(([
      sourceFolders,
      destinationFiles,
    ]) => (
      from(
        destinationFiles
      )
      .pipe(
        map((
          destinationFileInfo,
        ) => (
          from(
            sourceFolders
          )
          .pipe(
            filter((
              folderInfo,
            ) => (
              (
                folderInfo
                .folderName
              )
              === (
                destinationFileInfo
                .filename
              )
            )),
            take(1),
            concatMap((
              folderInfo,
            ) => (
              merge([
                (
                  readFiles({
                    parentDirectory: (
                      folderInfo
                      .fullPath
                    ),
                  })
                  .pipe(
                    concatAll(),
                    map((
                      fileInfo,
                    ) => ({
                      fileInfo,
                      type: "input",
                    } as const)),
                  )
                ),
                (
                  from(
                    access(
                      join(
                        (
                          folderInfo
                          .fullPath
                        ),
                        "attachments",
                      )
                    )
                  )
                  .pipe(
                    concatMap(() => (
                      readFiles({
                        parentDirectory: (
                          join(
                            (
                              folderInfo
                              .fullPath
                            ),
                            "attachments",
                          )
                        ),
                      })
                    )),
                    concatAll(),
                    map((
                      fileInfo,
                    ) => ({
                      fileInfo,
                      type: "attachment",
                    } as const)),
                    catchError(() => (
                      EMPTY
                    )),
                  )
                ),
              ])
              .pipe(
                concatAll(),
                toArray(),
                concatMap((
                  files,
                ) => (
                  from(
                    stat(
                      destinationFileInfo
                      .fullPath
                    )
                  )
                  .pipe(
                    concatMap(({
                      size,
                    }) => (
                      mergeTracksFfmpeg({
                        attachmentFilePaths: (
                          files
                          .filter(({
                            type,
                          }) => (
                            type
                            === "attachment"
                          ))
                          .map(({
                            fileInfo
                          }) => (
                            fileInfo
                            .fullPath
                          ))
                        ),
                        destinationFilePath: (
                          destinationFileInfo
                          .fullPath
                        ),
                        fileSizeInKilobytes: (
                          size
                          / 1024
                        ),
                        inputFilePaths: (
                          [
                            destinationFileInfo
                            .fullPath
                          ]
                          .concat(
                            files
                            .filter(({
                              type,
                            }) => (
                              type
                              === "input"
                            ))
                            .map(({
                              fileInfo
                            }) => (
                              fileInfo
                              .fullPath
                            ))
                          )
                        ),
                        // offsetInMilliseconds,
                      })
                    ))
                  )
                )),
                tap(() => {
                  console
                  .info(
                    (
                      chalk
                      .green(
                        "[CREATED MERGED FILE]"
                      )
                    ),
                    (
                      destinationFileInfo
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
          )
        )),
      )
    )),
    concatAll(),
    toArray(),
    tap(() => {
      process
      .exit()
    }),
    catchNamedError(
      mergeTracks
    )
  )
)

mergeTracks()
.subscribe()
