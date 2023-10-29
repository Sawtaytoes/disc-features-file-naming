import {
  mergeAll,
  mergeMap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getDemoName } from "./getDemoName.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"

export const nameDemoFiles = ({
  sourcePath,
}: {
  sourcePath: string
}) => (
  readFiles({
    sourcePath,
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
