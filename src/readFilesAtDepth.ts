import {
  concat,
  concatMap,
  EMPTY,
  iif,
} from "rxjs"

import { readFiles } from "./readFiles.js"
import { readFolder } from "./readFolder.js"
import { catchNamedError } from "./catchNamedError.js"

export const readFilesAtDepth = ({
  depth,
  sourcePath,
}: {
  depth: number,
  sourcePath: string
}): (
  ReturnType<
    typeof readFiles
  >
) => (
  concat(
    (
      readFiles({
        sourcePath,
      })
    ),
    (
      iif(
        () => (
          depth
          > 0
        ),
        (
          readFolder({
            sourcePath,
          })
          .pipe(
            concatMap((
              folderInfo,
            ) => (
              readFilesAtDepth({
                depth: (depth - 1),
                sourcePath: (
                  folderInfo
                  .fullPath
                ),
              })
            )),
          )
        ),
        EMPTY,
      )
    ),
  )
  .pipe(
    catchNamedError(
      readFilesAtDepth
    ),
  )
)
