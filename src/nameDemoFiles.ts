import "@total-typescript/ts-reset"
import "dotenv/config"

import {
  mergeAll,
  mergeMap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"
import { getDemoName } from "./getDemoName.js"

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

export const nameDemoFiles = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    mergeAll(),
    mergeMap((
      fileInfo,
    ) => (
      getMediaInfo(
        fileInfo
        .fullPath
      )
      .pipe(
        mergeMap((
          mediaInfo,
        ) => (
          getDemoName({
            filename: (
              fileInfo
              .filename
            ),
            mediaInfo,
          })
        )),
        mergeMap((
          renamedFilename,
        ) => (
          fileInfo
          .renameFile(
            renamedFilename
          )
        )),
      )
    )),
    catchNamedError(
      nameDemoFiles
    )
  )
)

nameDemoFiles()
.subscribe()
