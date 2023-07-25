import {
  filter,
  from,
  map,
  reduce,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

export const extraTypes = [
  "behindthescenes",
  "deleted",
  "featurette",
  "interview",
  "other",
  "scene",
  "short",
  "trailer",
] as const

export type ExtraType = (
  | typeof extraTypes[number]
  | "unknown"
)

export type Extra = {
  children?: (
    Extra[]
  ),
  parentType: ExtraType,
  timecode?: string,
  text: string,
  type: ExtraType,
}

export const extraMatchKeys = [
  "behind the scenes",
  "clip",
  "deleted scene",
  "documentary",
  "featurette",
  "interview",
  "montage",
  "music video",
  "outtakes",
  "promotional",
  "q&a",
  "short",
  "story",
  "trailer",
] as const

export type ExtraMatchKey = typeof extraMatchKeys[number]

export const extraMatchTypes: (
  Record<
    ExtraMatchKey,
    ExtraType
  >
) = {
  "behind the scenes": "behindthescenes",
  "clip": "featurette",
  "deleted scene": "deleted",
  "documentary": "behindthescenes",
  "featurette": "featurette",
  "interview": "interview",
  "montage": "featurette",
  "music video": "short",
  "outtakes": "deleted",
  "promotional": "trailer",
  "q&a": "interview",
  "short": "short",
  "story": "short",
  "trailer": "trailer",
}

export const parseExtras = (
  extrasText: string,
): (
  Observable<
    Extra[]
  >
) => (
  from(
    extrasText
    .split(
      "\n"
    )
  )
  .pipe(
    map((
      lineItem
    ) => (
      lineItem
      .trim()
    )),
    filter(
      Boolean
    ),
    filter((
      lineItem
    ) => (
      !(
        lineItem
        .startsWith(
          "* The Film"
        )
      )
    )),
    filter((
      lineItem
    ) => (
      !(
        lineItem
        .includes(
          "pages)"
        )
      )
      && !(
        lineItem
        .includes(
          "images)"
        )
      )
    )),
    filter((
      lineItem
    ) => (
      !(
        Boolean(
          lineItem
          .match(
            /^DISC (ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT)/
          )
        )
      )
    )),
  )
  .pipe(
    map((
      lineItem
    ) => ({
      text: lineItem,
    })),
    map(({
      text,
      ...otherProps
    }) => {
      const matches = (
        text
        .match(
          /\((\d+:\d+)\)/
        )
      )

      if (
        matches
      ) {
        const timecode = (
          matches
          .at(1)
        )

        if (timecode) {
          return {
            ...otherProps,
            text: (
              text
              .replace(
                / \(\d+:\d+\)/,
                "",
              )
            ),
            timecode,
          }
        }
      }

      return {
        ...otherProps,
        timecode: undefined,
        text,
      }
    }),
    map(({
      text,
      ...otherProps
    }) => {
      const matches = (
        text
        .match(
          /^([\*-–] )/
        )
      )

      const modifiedText = (
        matches
        ? (
          text
          .replace(
            (
              (
                matches
                .at(1)
              )
              || ""
            ),
            "",
          )
        )
        : text
      )

      return {
        ...otherProps,
        isChild: (
          Boolean(
            matches
          )
        ),
        text: modifiedText,
      }
    }),
    map(({
      text,
      ...otherProps
    }) => {
      const matches = (
        text
        .match(
          new RegExp(
            (
              extraMatchKeys
              .join('|')
            ),
            'i',
          )
        )
      )

      if (
        matches
      ) {
        const extraMatchKey = (
          matches
          .at(0)
        )

        if (
          extraMatchKey
        ) {
          return {
            ...otherProps,
            text,
            type: (
              extraMatchTypes[
                extraMatchKey
                .toLowerCase() as (
                  ExtraMatchKey
                )
              ]
            )
          }
        }
      }

      return {
        ...otherProps,
        text,
        type: "unknown" as (
          ExtraType
        ),
      }
    }),
    reduce(
      (
        combined,
        {
          isChild,
          ...otherProps
        }
      ) => {
        if (
          isChild
        ) {
          const parent = (
            combined
            .slice(-1)
            .at(0)
          )

          if (parent) {
            return (
              combined
              .slice(0, -1)
              .concat({
                ...parent,
                children: (
                  (
                    parent
                    .children
                  )
                  ? (
                    parent
                    .children
                    .concat({
                      ...otherProps,
                      parentType: (
                        parent
                        .type
                      )
                    })
                  )
                  : [{
                    ...otherProps,
                    parentType: (
                      parent
                      .type
                    )
                  }]
                )
              })
            )
          }
        }

        return (
          combined
          .concat({
            ...otherProps,
            parentType: "unknown",
          })
        )
      },
      [] as (
        Extra[]
      ),
    ),
    catchNamedError(
      parseExtras
    ),
  )
)
