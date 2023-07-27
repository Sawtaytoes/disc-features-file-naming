import "@total-typescript/ts-reset"
import "dotenv/config"

import { inspect } from "node:util"
import {
  filter,
  ignoreElements,
  map,
  mergeAll,
  mergeMap,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import { getDiscWorthIt } from "./getDiscWorthIt.js"
import { readFolders } from "./readFolders.js"

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
  parentDirectory,
} = (
  getArgValues()
)

export const hasBetterVersion = () => (
  getDiscWorthIt()
  .pipe(
    mergeMap((
      worthItGroups,
    ) => (
      readFolders({
        parentDirectory,
      })
      .pipe(
        mergeAll(),
        // take(1),
        map((
          fileFolder,
        ) => ({
          movieName: (
            fileFolder
            .foldername
            .replace(
              /(.+) \(\d{4}\)/,
              "$1",
            )
          ),
          movieNameWithYear: (
            fileFolder
            .foldername
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
    ignoreElements(),
    catchNamedError(
      hasBetterVersion
    )
  )
)

hasBetterVersion()
.subscribe()
