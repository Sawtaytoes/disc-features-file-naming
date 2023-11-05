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
import {
  fileExtensionsWithSubtitles,
  mergeSubtitlesMkvToolNix,
} from "./mergeSubtitlesMkvToolNix.js"
import { readFiles } from "./readFiles.js"
import { readFolder } from "./readFolder.js"

export const mergeTracks = ({
  mediaFilesPath,
  subtitlesPath,
}: {
  mediaFilesPath: string
  subtitlesPath: string
}) => (
  combineLatest([
    (
      readFolder({
        sourcePath: (
          subtitlesPath
        ),
      })
    ),
    (
      readFiles({
        sourcePath: (
          mediaFilesPath
        ),
      })
    ),
  ])
  .pipe(
    concatMap(([
      subtitlesFolder,
      mediaFiles,
    ]) => (
      from(
        mediaFiles
      )
      .pipe(
        map((
          mediaFileInfo,
        ) => (
          from(
            subtitlesFolder
          )
          .pipe(
            filter((
              subtitlesFolderInfo,
            ) => (
              (
                subtitlesFolderInfo
                .folderName
              )
              === (
                mediaFileInfo
                .filename
              )
            )),
            take(1),
            concatMap((
              subtitlesFolderInfo,
            ) => (
              combineLatest([
                (
                  readFiles({
                    sourcePath: (
                      subtitlesFolderInfo
                      .fullPath
                    ),
                  })
                  .pipe(
                    concatAll(),
                    filter((
                      subtitlesFileInfo,
                    ) => (
                      fileExtensionsWithSubtitles
                      .has(
                        extname(
                          subtitlesFileInfo
                          .fullPath
                        )
                      )
                    )),
                    take(1),
                    map((
                      subtitlesFileInfo,
                    ) => (
                      subtitlesFileInfo
                      .fullPath
                    )),
                  )
                ),
                (
                  from(
                    access(
                      join(
                        (
                          subtitlesFolderInfo
                          .fullPath
                        ),
                        "attachments",
                      )
                    )
                  )
                  .pipe(
                    concatMap(() => (
                      readFiles({
                        sourcePath: (
                          join(
                            (
                              subtitlesFolderInfo
                              .fullPath
                            ),
                            "attachments",
                          )
                        ),
                      })
                    )),
                    concatAll(),
                    map((
                      attachmentsFileInfo,
                    ) => (
                      attachmentsFileInfo
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
                      mediaFileInfo
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
