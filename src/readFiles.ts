import {
  rename,
} from "node:fs"
import {
  access,
  constants,
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
  tap,
  of,
  catchError,
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
      filename: (
        path
        .basename(
          filename,
          (
            path
            .extname(
              filename
            )
          ),
        )
      ),
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
        of({
          oldFilename: (
            parentDirectory
            .concat(
              path.sep,
              filename,
            )
          ),
          newFilename: (
            parentDirectory
            .concat(
              path.sep,
              renamedFilename,
              (
                path
                .extname(
                  filename
                )
              ),
            )
          )
        })
        .pipe(
          filter(({
            newFilename,
            oldFilename,
          }) => (
            newFilename
            !== oldFilename
          )),
          mergeMap(({
            newFilename,
            oldFilename,
          }) => (
            from(
              access(
                newFilename,
                (
                  constants
                  .F_OK
                ),
              )
            )
            .pipe(
              tap(() => {
                throw (
                  "File already exists for "
                  .concat(
                    `"${renamedFilename}"`
                  )
                )
              }),
              catchError(() => (
                bindNodeCallback(
                  rename,
                )(
                  oldFilename,
                  newFilename,
                )
              )),
            )
          )),
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
