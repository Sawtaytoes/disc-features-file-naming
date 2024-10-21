import {
  map,
  mergeAll,
  mergeMap,
  toArray,
} from 'rxjs'
import { readFiles } from './readFiles.js';
import { catchNamedError } from './catchNamedError.js';


export const renameMovieClipDownloads = ({
  sourcePath,
}: {
  sourcePath: string
}) => (
  readFiles({
    sourcePath,
  })
  .pipe(
    mergeAll(),
    map((
      fileInfo,
    ) => (
      () => (
        fileInfo
        .renameFile(
          fileInfo
          .filename
          .replace(
            /(.+) \[(\d+)\] \((.+)\) (.+)\.(.{3})/,
            "$1 ($2) [$3] {$4}.$5",
          )
          .replace(
            /(.+) \(\w+\)-\d{3}/,
            "$1",
          )
          .replace(
            /(.+)-\d{3}/,
            "$1",
          )
          .replace(
            /(.+) \d+bits/,
            "$1",
          )
          .replace(
            /(.+) \d+bits/,
            "$1",
          )
        )
      )
    )),
    toArray(),
    mergeAll(),
    mergeMap((
      renameFile,
    ) => (
      renameFile()
    )),
    catchNamedError(
      renameMovieClipDownloads
    ),
  )
)
