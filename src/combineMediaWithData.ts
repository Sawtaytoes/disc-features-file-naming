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
import { convertNumberToTimeString } from "./getFileDurationTimecode.js";
import { getUserSearchInput } from "./getUserSearchInput.js";
import {
  specialFeatureTypes,
  type SpecialFeature,
} from "./parseSpecialFeatures.js";

export const specialFeatureMatchRenames = [
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
    searchTerm: /(.*) scene$/i,
    replacement: "$1 -scene",
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
  filename,
  specialFeatures,
  timecode: mediaTimecode,
}: {
  filename: string,
  specialFeatures: SpecialFeature[],
  timecode: string,
}): (
  Observable<
    string
  >
) => (
  of(
    null
  )
  .pipe(
    mergeMap(() => {
      const matchingExtras = (
        specialFeatures
        .filter(({
          timecode: specialFeatureTimecode,
        }) => (
          getIsSimilarTimecode(
            mediaTimecode,
            specialFeatureTimecode,
          )
        ))
        .concat(
          specialFeatures
          .filter(({
            timecode: specialFeatureTimecode,
          }) => (
            !specialFeatureTimecode
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
            timecode: SpecialFeatureChildTimecode,
          }) => (
            getIsSimilarTimecode(
              mediaTimecode,
              SpecialFeatureChildTimecode,
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
          filename,
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
      const specialFeatureMatchRename = (
        specialFeatureMatchRenames
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
        specialFeatureMatchRename
      ) {
        const {
          searchTerm,
          replacement,
        } = (
          specialFeatureMatchRename
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
            filename,
            "\n",
            text,
            "\n",
            specialFeatureTypes
            .map((
              specialFeatureType,
              index,
            ) => (
              `${index} | ${specialFeatureType}`
            ))
          )

          return (
            getUserSearchInput()
            .pipe(
              map((
                selectedIndex
              ) => (
                specialFeatureTypes
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
    catchNamedError(
      combineMediaWithData
    ),
  )
)
