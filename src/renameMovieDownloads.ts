import {
  readdir,
  rename,
  stat,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  catchError,
  EMPTY,
  filter,
  from,
  ignoreElements,
  map,
  mergeAll,
  mergeMap,
  take,
  tap,
} from 'rxjs'

process.on('uncaughtException', (exception) => {
  console.error(exception)
})

// -----------------------------------------------------

const parentDirectory = process.argv[2]

if (!parentDirectory) {
  throw new Error('You need to enter a parent directory.')
}

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
  ) => (
    parentDirectory
    .concat(
      path.sep,
      filename,
    )
  )),
  // take(12),
  mergeMap((
    filename,
  ) => (
    from(
      stat(
        filename
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
        filename
      )),
    )
  )),
  filter((
    filename,
  ) => (
    Boolean(
      filename
    )
  )),
  map((
    filename: string,
  ) => ({
    nextFilename: (
      filename
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
    ),
    previousFilename: (
      filename
    ),
  })),
  filter(({
    nextFilename,
    previousFilename,
  }) => (
    nextFilename
    !== previousFilename
  )),
  tap(({
    nextFilename,
    previousFilename,
  }) => {
    console.log(previousFilename)
    console.log(nextFilename)
    console.log()
  }),
  // -------------------------------------
  // UNCOMMENT THIS TO SAFELY DEBUG CHANGES
  // -------------------------------------
  // ignoreElements(),
  // -------------------------------------
  map(({
    nextFilename,
    previousFilename,
  }) => (
    rename(
      previousFilename,
      nextFilename,
    ))
  ),
  mergeAll(
    os
    .cpus()
    .length
  ),
  catchError((
    error,
  ) => {
    console
    .error(
      error
    )

    return EMPTY
  }),
)
.subscribe()
