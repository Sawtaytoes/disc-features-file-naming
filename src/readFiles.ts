import {
  readdir,
  stat,
} from "node:fs/promises"
import { join } from "node:path"
import {
  concatAll,
  concatMap,
  filter,
  from,
  map,
  toArray,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { createRenameFileOrFolder, getFilenameFromFilePath } from "./createRenameFileOrFolder.js"

export type FileInfo = {
  filename: (
    string
  ),
  fullPath: (
    string
  ),
  renameFile: (
    renamedFilename: string,
  ) => (
    Observable<
      void
    >
  )
}

export const getIsFile = (
  fullPath: string
): (
  Observable<
    void
  >
) => (
  from(
    stat(
      fullPath
    )
  )
  .pipe(
    filter((
      stats
    ) => (
      stats
      .isFile()
    )),
    map(() => (
      // @ts-ignore
      console.log('3243yi')||
      void(0)
    )),
  )
)

export const readFiles = ({
  sourcePath,
}: {
  sourcePath: string,
}): (
  Observable<
    FileInfo
  >
) => (
  from(
    readdir(
      sourcePath
    )
  )
  .pipe(
    concatAll(),
    map((
      filePath,
    ) => ({
      filename: (
        getFilenameFromFilePath(
          filePath
        )
      ),
      fullPath: (
        join(
          sourcePath,
          filePath,
        )
      ),
    })),
    concatMap(({
      filename,
      fullPath,
    }) => (
      getIsFile(
        fullPath
      )
      .pipe(
        map(() => ({
          filename,
          fullPath,
          renameFile: (
            createRenameFileOrFolder({
              fullPath,
              sourcePath,
            })
          ),
        } satisfies (
          FileInfo
        ) as (
          FileInfo
        ))),
      )
    )),
    // TODO: Check if these are still required.
    // toArray(),
    // concatAll(),
    catchNamedError(
      readFiles
    ),
  )
)
