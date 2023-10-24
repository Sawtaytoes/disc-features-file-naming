import "@total-typescript/ts-reset"
import "dotenv/config"

import chalk from "chalk"
import { extname } from "node:path"
import {
  concatAll,
  concatMap,
  filter,
  from,
  map,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { naturalSort } from "./naturalSort.js"
import { readFiles } from "./readFiles.js"
import { splitChaptersMkvToolNix } from "./splitChaptersMkvToolNix.js"
import { videoFileExtensions } from "./videoFileExtensions.js"

process
.on(
  "uncaughtException",
  (exception) => {
    console
    .error(
      exception
    )
  },
)

const {
  chapterSplitsList,
  parentDirectory,
} = (
  getArgValues()
)

export const splitChapters = () => (
  readFiles({
    parentDirectory,
  })
  .pipe(
    concatMap((
      fileInfos,
    ) => (
      from(
        naturalSort(
          fileInfos
        )
        .by({
          asc: (
            fileInfo,
          ) => (
            fileInfo
            .filename
          ),
        })
      )
      .pipe(
        filter((
          fileInfo,
        ) => (
          videoFileExtensions
          .has(
            extname(
              fileInfo
              .fullPath
            )
          )
        )),
        map((
          fileInfo,
          index,
        ) => (
          splitChaptersMkvToolNix({
            chapterSplits: (
              chapterSplitsList
              [index]
              .split(" ")
              .join(",")
            ),
            filePath: (
              fileInfo
              .fullPath
            ),
          })
          .pipe(
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED SUBTITLED FILE]"
                  )
                ),
                (
                  fileInfo
                  .fullPath
                ),
                "\n",
                "\n",
              )
            }),
            filter(
              Boolean
            ),
          )
        )),
        concatAll(),
        toArray(),
        tap(() => {
          process
          .exit()
        })
      )
    )),
    catchNamedError(
      splitChapters
    ),
  )
)

splitChapters()
.subscribe()
