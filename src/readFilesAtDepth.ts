import {
  mergeAll,
  mergeMap,
} from "rxjs"

import { readFiles } from "./readFiles.js"
import { readFolder } from "./readFolder.js"

export const readFilesAtDepth = ({
  depth,
  sourcePath,
}: {
  depth: 0 | 1,
  sourcePath: string
}) => (
  depth === 0
  ? (
    readFiles({
      sourcePath,
    })
  )
  : (
    readFolder({
      sourcePath,
    })
    .pipe(
      mergeAll(),
      mergeMap((
        folderInfo,
      ) => (
        readFiles({
          sourcePath: (
            folderInfo
            .fullPath
          )
        })
      )),
    )
  )
)
