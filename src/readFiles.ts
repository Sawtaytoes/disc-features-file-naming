import chalk from "chalk"
import {
  rename,
} from "node:fs"
import {
  readdir,
  stat,
} from "node:fs/promises"
import path, { join } from "node:path"
import {
  bindNodeCallback,
  catchError,
  concatAll,
  concatMap,
  filter,
  from,
  map,
  of,
  tap,
  toArray,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

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

export const readFiles = ({
  sourcePath,
}: {
  sourcePath: string,
}): (
  Observable<
    FileInfo[]
  >
) => (
  from(
    readdir(
      sourcePath
    )
  )
  .pipe(
    concatAll(),
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
        join(
          sourcePath,
          filename,
        )
      ),
      renameFile: (
        renamedFilename,
      ) => (
        of({
          oldFilename: (
            join(
              sourcePath,
              filename,
            )
          ),
          newFilename: (
            join(
              sourcePath,
              renamedFilename,
            )
            .concat(
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
          tap(({
            newFilename,
            oldFilename,
          }) => {
            console
            .info(
              (
                chalk
                .green(
                  "[RENAMING]"
                )
              ),
              "\n",
              oldFilename,
              "\n",
              newFilename,
              "\n",
              "\n",
            )
          }),
          // ignoreElements(), // UNCOMMENT TO PREVENT WRITING FILES
          concatMap(({
            newFilename,
            oldFilename,
          }) => (
            from(
              stat(
                newFilename,
              )
            )
            .pipe(
              catchError(() => (
                bindNodeCallback(
                  rename,
                )(
                  oldFilename,
                  newFilename,
                )
              )),
              map((
                stats,
              ) => {
                if (
                  stats
                ) {
                  throw (
                    "File already exists for "
                    .concat(
                      `"${renamedFilename}"`
                    )
                  )
                }
              }),
            )
          )),
          catchNamedError(
            readFiles
          ),
        )
      )
    } satisfies (
      FileInfo
    ) as (
      FileInfo
    ))),
    concatMap((
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
