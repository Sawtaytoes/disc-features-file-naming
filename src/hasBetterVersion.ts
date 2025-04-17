import chalk from "chalk"
import {
  filter,
  map,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { filterIsVideoFile } from "./filterIsVideoFile.js"
import { getUhdDiscForumPostData } from "./getUhdDiscForumPostData.js"
import { logInfo } from "./logMessage.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const hasBetterVersion = ({
  isRecursive,
  recursiveDepth = 1,
  sourcePath,
}: {
  isRecursive: boolean,
  recursiveDepth: number,
  sourcePath: string
}) => (
  getUhdDiscForumPostData()
  .pipe(
    mergeMap((
      uhdDiscForumPostGroups,
    ) => (
      readFilesAtDepth({
        depth: (
          isRecursive
          ? recursiveDepth
          : 0
        ),
        sourcePath,
      })
      .pipe(
        filterIsVideoFile(),
        filter((
          fileInfo
        ) => (
          !(
            /^.+ (-\w+)$/
            .test(
              fileInfo
              .filename
            )
          )
        )),
        map((
          fileInfo,
        ) => ({
          movieName: (
            fileInfo
            .filename
            .replace(
              /(.+) \(\d{4}\)/,
              "$1",
            )
          ),
          movieNameWithYear: (
            fileInfo
            .filename
          ),
        })),
        map(({
          movieName,
          movieNameWithYear,
        }) => ({
          matchingSections: (
            uhdDiscForumPostGroups
            .map(({
              items,
              title,
            }) => ({
              items: (
                items
                .filter(({
                  movieName: uhdDiscForumPostMovieName,
                }) => (
                  (
                    uhdDiscForumPostMovieName
                    === movieName
                  )
                  || (
                    uhdDiscForumPostMovieName
                    === movieNameWithYear
                  )
                ))
              ),
              sectionTitle: title,
            }))
            .filter(({
              items,
            }) => (
              (
                items
                .length
              )
              > 0
            ))
          ),
          movieNameWithYear,
        })),
        filter(({
          matchingSections,
        }) => (
          (
            matchingSections
            ?.length
          )
          > 0
        )),
      )
    )),
    map(({
      matchingSections,
      ...otherProps
    }) => ({
      ...otherProps,
      matchingSections: (
        matchingSections
        .map(({
          items,
          sectionTitle,
        }) => (
          chalk
          .blue(
            `  ${sectionTitle}`
          )
          .concat(
            "\n",
            (
              items
              .map(({
                publisher,
                reasons,
              }) => (
                chalk
                .cyan(
                  `    Publisher:`
                )
                .concat(
                  ` ${publisher}`,
                  "\n",
                  (
                    reasons
                    ?.map((
                      reason,
                    ) => (
                      `    - ${reason}`
                    ))
                    .join("\n")!
                  ),
                )
              ))
              .find(Boolean)!
            )
          )
        ))
        .join("\n\n")
      )
    })),
    tap(({
      matchingSections,
      movieNameWithYear,
    }) => {
      console
      .info(
        (
          chalk
          .green(
            movieNameWithYear
          )
        ),
        "\n",
        matchingSections,
      )
    }),
    catchNamedError(
      hasBetterVersion
    )
  )
)
