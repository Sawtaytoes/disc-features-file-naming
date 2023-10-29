import chalk from "chalk"
import {
  concatAll,
  concatMap,
  filter,
  from,
  map,
  take,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { naturalSort } from "./naturalSort.js"
import { readFiles } from "./readFiles.js"
import { splitChaptersMkvToolNix } from "./splitChaptersMkvToolNix.js"

export const splitChapters = ({
  chapterSplitsList,
  sourcePath,
}: {
  chapterSplitsList: string[]
  sourcePath: string
}) => (
  readFiles({
    sourcePath,
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
          getIsVideoFile(
            fileInfo
            .fullPath
          )
        )),
        take(
          chapterSplitsList
          .length
        ),
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
