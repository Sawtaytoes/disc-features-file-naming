import {
  filter,
  map,
  mergeAll,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getDiscWorthIt } from "./getDiscWorthIt.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const hasBetterVersion = ({
  isRecursive,
  sourcePath,
}: {
  isRecursive: boolean,
  sourcePath: string
}) => (
  getDiscWorthIt()
  .pipe(
    mergeMap((
      worthItGroups,
    ) => (
      readFilesAtDepth({
        depth: (
          isRecursive
          ? 1
          : 0
        ),
        sourcePath,
      })
      .pipe(
        mergeAll(),
        filter((
          fileInfo
        ) => (
          getIsVideoFile(
            fileInfo
            .filename
          )
        )),
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
            worthItGroups
            .map(({
              items,
              title,
            }) => ({
              items: (
                items
                .filter(({
                  movieName: worthItMovieName,
                }) => (
                  (
                    worthItMovieName
                    === movieName
                  )
                  || (
                    worthItMovieName
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
        mergeMap(({
          matchingSections,
        }) => (
          matchingSections
          .flatMap(({
            items,
            ...otherProps
          }) => (
            items
            .map((
              item
            ) => ({
              ...otherProps,
              ...item,
            }))
          ))
        )),
      )
    )),
    tap(
      console
      .info
    ),
    catchNamedError(
      hasBetterVersion
    )
  )
)
