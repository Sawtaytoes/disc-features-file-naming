import {
  concat,
  concatMap,
  EMPTY,
  filter,
  iif,
} from "rxjs"

import { logPipelineError } from "./logPipelineError.js"
import { readFiles } from "./readFiles.js"
import { readFolder } from "./readFolder.js"

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
            filter(Boolean),
          )
        ),
        EMPTY,
      )
    ),
  )
  .pipe(
    logPipelineError(
      readFilesAtDepth
    ),
  )
)
