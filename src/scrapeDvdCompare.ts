import {
  readdir,
  rename,
  stat,
} from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import {
  catchError,
  combineLatest,
  EMPTY,
  filter,
  finalize,
  from,
  groupBy,
  ignoreElements,
  map,
  merge,
  mergeAll,
  mergeMap,
  Observable,
  of,
  take,
  tap,
  toArray,
  zip,
} from "rxjs"

// -----------------------------------------------------

export const scrapeDvdCompare = ({
  filenames,
  searchTerm,
}: {
  filenames: string[]
  searchTerm: string,
}) => (
  from(
    filenames
  )
  .pipe(
    map((
      filenames,
    ) => (
      from(
        []
        // malScraper
        // .getResultsFromSearch(
        //   (
        //     searchString
        //     || (
        //       path
        //       .basename(
        //         parentDirectory
        //       )
        //     )
        //   ),
        //   "anime",
        // )
      )
    )),
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
)
