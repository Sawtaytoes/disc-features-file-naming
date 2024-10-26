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
import { filterIsVideoFile } from "./filterIsVideoFile.js"
import { naturalSort } from "./naturalSort.js"
import { readFiles } from "./readFiles.js"
import { splitChaptersMkvMerge } from "./splitChaptersMkvMerge.js"

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
          splitChaptersMkvMerge({
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
