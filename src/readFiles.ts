import {
  rename,
} from "node:fs"
import {
  readdir,
  stat,
} from "node:fs/promises"
import path from "node:path"
import {
  bindNodeCallback,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  toArray,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"

export type File = {
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

export const readFiles = ({
  parentDirectory,
}: {
  parentDirectory: string,
}): (
  Observable<
    File[]
  >
) => (
  from(
    readdir(
      parentDirectory
    )
  )
  .pipe(
    mergeAll(),
    // filter((
    //   filename,
    // ) => (
    //   filename
    //   // -------------------------------------
    //   // UNCOMMENT THIS TIME TO TEST A SINGLE FILE
    //   // && filename.startsWith('The Rock')
    //   // -------------------------------------
    // )),
    map((
      filename,
    ) => ({
      filename,
      fullPath: (
        parentDirectory
        .concat(
          path.sep,
          filename,
        )
      ),
      renameFile: (
        renamedFilename: string,
      ) => (
        bindNodeCallback(
          rename,
        )(
          (
            parentDirectory
            .concat(
              path.sep,
              filename,
            )
          ),
          (
            parentDirectory
            .concat(
              path.sep,
              renamedFilename,
            )
          ),
        )
      )
    } satisfies (
      File
    ) as (
      File
    ))),
    mergeMap((
      file,
    ) => (
      from(
        stat(
          file
          .fullPath
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
          file
        )),
      )
    )),
    toArray(),
    catchNamedError(
      readFiles
    ),
  )
)
