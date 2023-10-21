import "@total-typescript/ts-reset"
import "dotenv/config"

import chalk from "chalk"
import {
  access,
} from "node:fs/promises"
import {
  extname,
  join,
} from "node:path"
import {
  catchError,
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
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import {
  fileExtensionsWithSubtitles,
  mergeSubtitlesMkvToolNix,
} from "./mergeSubtitlesMkvToolNix.js"
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
  globalOffsetInMilliseconds,
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
              combineLatest([
                (
                  readFiles({
                    parentDirectory: (
                      folderInfo
                      .fullPath
                    ),
                  })
                  .pipe(
                    concatAll(),
                    filter((
                      fileInfo,
                    ) => (
                      fileExtensionsWithSubtitles
                      .has(
                        extname(
                          fileInfo
                          .fullPath
                        )
                      )
                    )),
                    take(1),
                    map((
                      fileInfo,
                    ) => (
                      fileInfo
                      .fullPath
                    )),
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
                    ) => (
                      fileInfo
                      .fullPath
                    )),
                    catchError(() => (
                      of(
                        null
                      )
                    )),
                    toArray(),
                    concatAll(),
                    filter(
                      Boolean
                    ),
                    toArray(),
                  )
                ),
              ])
              .pipe(
                concatMap(([
                  subtitlesFilePath,
                  attachmentFilePaths,
                ]) => (
                  mergeSubtitlesMkvToolNix({
                    attachmentFilePaths,
                    audioLanguage: "jpn",
                    destinationFilePath: (
                      destinationFileInfo
                      .fullPath
                    ),
                    // offsetInMilliseconds,
                    subtitlesFilePath,
                    subtitlesLanguage: "eng",
                  })
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
