import {
  filter,
  map,
  mergeAll,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getUhdDiscForumPostData } from "./getUhdDiscForumPostData.js"
import { filterIsVideoFile } from "./filterIsVideoFile.js"
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
        // filter(({
        //   reasons,
        //   sectionTitle,
        // }) => (
        //   (
        //     sectionTitle === "Reference 4K titles and/or spectacular upgrades from the most recent BD"
        //     || sectionTitle === "Appreciable/Solid upgrades compared to the most recent Blu-Rays"
        //   )
        //   ? (
        //     Boolean(
        //       reasons
        //       && (
        //         (
        //           reasons
        //           .length
        //         )
        //         > 0
        //       )
        //     )
        //   )
        //   : true
        // )),
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
