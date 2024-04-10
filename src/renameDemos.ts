import {
  mergeAll,
  mergeMap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getDemoName } from "./getDemoName.js"
import { getMediaInfo } from "./getMediaInfo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const renameDemos = ({
  isRecursive,
  sourcePath,
}: {
  isRecursive: boolean
  sourcePath: string
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
      renameDemos
    )
  )
)
