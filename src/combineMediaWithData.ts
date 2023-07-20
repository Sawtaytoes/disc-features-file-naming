import {
  execFile as execFileCallback,
} from 'node:child_process';
import {
  promisify,
} from 'node:util'
import {
  filter,
  from,
  map,
  mergeMap,
  tap,
  toArray,
  type Observable,
  mergeAll,
  take,
  of,
  withLatestFrom,
  concatMap,
  lastValueFrom,
  EMPTY,
} from "rxjs"

import { catchNamedError } from "./catchNamedError"
import { type Media } from './getFileVideoTimes';
import {
  extraTypes,
  type Extra,
} from './parseExtras';
import { type FilenameRename } from './renameFiles';
import { getUserSearchInput } from './getUserSearchInput';

export const extraMatchRenames = [
  {
    searchTerm: /(.*deleted.*)/i,
    replacement: "$1 -deleted",
  },
  {
    searchTerm: /(trailers?)$/i,
    replacement: "$1 -trailer",
  },
  {
    searchTerm: /(featurettes?)$/i,
    replacement: "-featurette",
  },
  {
    searchTerm: /(.*documentary.*)/i,
    replacement: "$1 -behindthescenes",
  },
  {
    searchTerm: /(.*behind the scenes.*)/i,
    replacement: "$1 -behindthescenes",
  },
  {
    searchTerm: /(q&a)$/i,
    replacement: "$1 -interview",
  },
  {
    searchTerm: /(interview)$/i,
    replacement: "$1 -interview",
  },
  {
    searchTerm: /(short)$/i,
    replacement: "$1 -short",
  },
  {
    searchTerm: /(story)$/i,
    replacement: "$1 -story",
  },
  {
    searchTerm: /(.*prologue.*)/i,
    replacement: "$1 -short",
  },
  {
    searchTerm: /(.*montage.*)/i,
    replacement: "$1 -featurette",
  },
  {
    searchTerm: /(clips?)$/i,
    replacement: "$1 -behindthescenes",
  },
] as const

export const combineMediaWithData = ({
  extras,
  media,
}: {
  extras: Extra[],
  media: Media,
}): (
  Observable<
    FilenameRename[]
  >
) => (
  of(
    media
  )
  .pipe(
    mergeMap(({
      timecode: mediaTimecode,
    }) => {
      const matchingExtras = (
        extras
        .filter(({
          timecode: extraTimecode,
        }) => (
          extraTimecode
          === mediaTimecode
        ))
        .concat(
          extras
          .filter(({
            timecode: extraTimecode,
          }) => (
            !extraTimecode
          ))
          .flatMap(({
            children,
          }) => (
            children
          ))
          .filter(
            Boolean
          )
          .filter(({
            timecode: extraChildTimecode,
          }) => (
            extraChildTimecode
            === mediaTimecode
          ))
        )
      )

      if (
        (
          matchingExtras
          .length
        )
        > 1
      ) {
        console
        .info(
          (
            media
            .file
            .filename
          ),
          "\n",
          matchingExtras
          .map((
            matchingExtra,
            index,
          ) => (
            `${index} | ${matchingExtra}`
          ))
        )

        return (
          getUserSearchInput()
          .pipe(
            map((
              selectedIndex
            ) => (
              matchingExtras
              .at(
                selectedIndex
              )
            )),
            filter(
              Boolean
            ),
          )
        )
      }

      if (
        (
          matchingExtras
          .length
        )
        === 1
      ) {
        return (
          of(
            matchingExtras
            .at(
              0
            )
          )
          .pipe(
            filter(
              Boolean
            ),
          )
        )
      }

      return EMPTY
    }),
    mergeMap(({
      parentType,
      text,
      type,
    }) => {
      const extraMatchRename = (
        extraMatchRenames
        .find(({
          searchTerm,
        }) => (
          text
          .match(
            searchTerm
          )
        ))
      )

      if (
        extraMatchRename
      ) {
        const {
          searchTerm,
          replacement,
        } = (
          extraMatchRename
        )

        return (
          of(
            text
            .replace(
              searchTerm,
              replacement,
            )
          )
        )
      }

      if (
        type === "unknown"
      ) {
        if (
          parentType === "unknown"
        ) {
          console
          .info(
            (
              media
              .file
              .filename
            ),
            "\n",
            text,
            "\n",
            extraTypes
            .map((
              extraType,
              index,
            ) => (
              `${index} | ${extraType}`
            ))
          )

          return (
            getUserSearchInput()
            .pipe(
              map((
                selectedIndex
              ) => (
                extraTypes
                .at(
                  selectedIndex
                )
              )),
              filter(
                Boolean
              ),
              map((
                selectedType,
              ) => (
                `${text} -${selectedType}`
              ))
            )
          )
        }

        return (
          of(
            `${text} -${parentType}`
          )
        )
      }

      return (
        of(
          `${text} -${type}`
        )
      )
    }),
    map((
      text,
    ) => ({
      nextFilename: text,
      previousFilename: (
        media
        .file
        .filename
      ),
    })),
    catchNamedError(
      combineMediaWithData
    ),
  )
)
