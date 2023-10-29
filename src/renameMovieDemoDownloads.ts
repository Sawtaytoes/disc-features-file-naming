import {
  readdir,
  rename,
  stat,
} from 'node:fs/promises';
import os from 'node:os';
import { join } from 'node:path';
import {
  catchError,
  EMPTY,
  filter,
  from,
  map,
  mergeAll,
  mergeMap,
  tap,
  toArray,
} from 'rxjs'
import { readFiles } from './readFiles.js';
import { catchNamedError } from './catchNamedError.js';


export const renameMovieDemoDownloads = ({
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
    )),
    toArray(),
    mergeAll(),
    mergeAll(),
    catchNamedError(
      renameMovieDemoDownloads
    ),
  )
)
