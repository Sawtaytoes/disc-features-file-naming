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
  OperatorFunction,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { createRenameFileOrFolderObservable, getLastItemInFilePath } from "./createRenameFileOrFolder.js"

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

export const filterFileAtPath = <
  PipelineValue
>(
  getFullPath: (
    pipelineValue: PipelineValue
  ) => string
): (
  OperatorFunction<
    PipelineValue,
    PipelineValue
  >
) => (
  concatMap((
    pipelineValue,
  ) => (
    from(
      stat(
        getFullPath(
          pipelineValue
        )
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
        pipelineValue
      )),
    )
  ))
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
        getLastItemInFilePath(
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
    filterFileAtPath(({
      fullPath
    }) => (
      fullPath
    )),
    map(({
      filename,
      fullPath,
    }) => ({
      filename,
      fullPath,
      renameFile: (
        createRenameFileOrFolderObservable({
          fullPath,
          sourcePath,
        })
      ),
    } satisfies (
      FileInfo
    ) as (
      FileInfo
    ))),
    catchNamedError(
      readFiles
    ),
  )
)
