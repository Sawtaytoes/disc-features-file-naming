import {
  filter,
  map,
  mergeMap,
  tap,
  of,
  EMPTY,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { convertNumberToTimeString, type Media } from "./getFileVideoTimes.js";
import { getUserSearchInput } from "./getUserSearchInput.js";
import {
  extraTypes,
  type Extra,
} from "./parseExtras.js";
import { File } from "./readFiles.js";

export const extraMatchRenames = [
  {
    searchTerm: /(.*deleted.*)/i,
    replacement: "$1 -deleted",
  },
  {
    searchTerm: /(.*outtakes.*)/i,
    replacement: "$1 -deleted",
  },
  {
    searchTerm: /(.*trailers?.*)/i,
    replacement: "$1 -trailer",
  },
  {
    searchTerm: /(featurettes?)$/i,
    replacement: "-featurette",
  },
  {
    searchTerm: /(.*featurettes?.*)/i,
    replacement: "$1 -featurette",
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
    searchTerm: /(.*making of.*)/i,
    replacement: "$1 -behindthescenes",
  },
  {
    searchTerm: /(.*interview.*)/i,
    replacement: "$1 -interview",
  },
  {
    searchTerm: /(.*q&a.*)$/i,
    replacement: "$1 -interview",
  },
  {
    searchTerm: /(.*promotional?.*)/i,
    replacement: "$1 -trailer",
  },
  {
    searchTerm: /(.*essay.*)/i,
    replacement: "$1 -featurette",
  },
  {
    searchTerm: /(.*shorts?.*)/i,
    replacement: "$1 -short",
  },
  {
    searchTerm: /(.*excerpts.*)$/i,
    replacement: "$1 -short",
  },
  {
    searchTerm: /(.*story.*)/i,
    replacement: "$1 -short",
  },
  {
    searchTerm: /(.*song.*)/i,
    replacement: "$1 -short",
  },
  {
    searchTerm: /(.*sing.*)/i,
    replacement: "$1 -short",
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

export const getTimecodeAtOffset = (
  timecode: string,
  offset: number,
) => {
  const date = (
    new Date(
      0,
      0,
      0,
      0,
      0,
      0,
    )
  )

  timecode
  .split(":")
  .reverse()
  .map((
    timeString
  ) => (
    Number(
      timeString
    )
  ))
  .forEach((
    timeValue,
    index,
  ) => {
    if (
      index
      === 0
    ) {
      date
      .setSeconds(
        timeValue
      )
    }
    else if (
      index
      === 1
    ) {
      date
      .setMinutes(
        timeValue
      )
    }
    else if (
      index
      === 2
    ) {
      date
      .setHours(
        timeValue
      )
    }
  })

  date
  .setSeconds(
    (
      date
      .getSeconds()
    )
    + offset
  )

  return (
    [
      (
        date
        .getHours()
      ),
      (
        date
        .getMinutes()
      ),
      (
        date
        .getSeconds()
      ),
    ]
    .filter((
      value,
      index,
    ) => (
      (
        index
        === 0
      )
      ? (
        Boolean(
          value
        )
      )
      : true
    ))
    .map((
      value,
      index,
    ) => (
      index > 0
      ? (
        convertNumberToTimeString(
          value
        )
      )
      : value
    ))
    .join(":")
  )
}

export const getIsSimilarTimecode = (
  timecodeA: string,
  timecodeB?: string,
) => (
  (
    timecodeA
    === timecodeB
  )
  || (
    (
      getTimecodeAtOffset(
        timecodeA,
        +1,
      )
    )
    === timecodeB
  )
  || (
    (
      getTimecodeAtOffset(
        timecodeA,
        -1,
      )
    )
    === timecodeB
  )
)

export const combineMediaWithData = ({
  extras,
  media,
}: {
  extras: Extra[],
  media: Media,
}): (
  Observable<
    ReturnType<
      File["renameFile"]
    >
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
          getIsSimilarTimecode(
            mediaTimecode,
            extraTimecode,
          )
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
            getIsSimilarTimecode(
              mediaTimecode,
              extraChildTimecode,
            )
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
          mediaTimecode,
          "\n",
          matchingExtras
          .map((
            matchingExtra,
            index,
          ) => ({
            index,
            matchingExtra,
          }))
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
              tap((
                selectedType,
              ) => {
                if (!selectedType) {
                  throw "Incorrect type selected."
                }
              }),
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
    ) => (
      text
      .replaceAll(
        /"/g,
        "",
      )
      .replaceAll(
        /: /g,
        " - ",
      )
      .replaceAll(
        /:/g,
        "-",
      )
      .replaceAll(
        / \/ /g,
        " - ",
      )
      .replaceAll(
        /\//g,
        " - ",
      )
    )),
    map((
      text,
    ) => {
      console
      .info({
        old: (
          media
          .file
          .filename
        ),
        new: text,
      })

      return (
        media
        .file
        .renameFile(
          text
        )
      )
    }),
    catchNamedError(
      combineMediaWithData
    ),
  )
)
