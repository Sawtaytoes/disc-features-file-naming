import {
  filter,
  from,
  map,
  reduce,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

export const specialFeatureTypes = [
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
  | typeof specialFeatureTypes[number]
  | "unknown"
)

export type SpecialFeature = {
  children?: (
    SpecialFeature[]
  ),
  parentType: ExtraType,
  timecode?: string,
  text: string,
  type: ExtraType,
}

export const specialFeatureMatchKeys = [
  "behind the scenes",
  "clip",
  "deleted scene",
  "documentary",
  "essay",
  "featurette",
  "interview",
  "montage",
  "music video",
  "outtakes",
  "promotional",
  "q&a",
  "short",
  "sing",
  "song",
  "story",
  "trailer",
] as const

export type SpecialFeatureMatchKey = (
  typeof specialFeatureMatchKeys[number]
)

export const specialFeatureMatchTypes: (
  Record<
    SpecialFeatureMatchKey,
    ExtraType
  >
) = {
  "behind the scenes": "behindthescenes",
  "clip": "featurette",
  "deleted scene": "deleted",
  "documentary": "behindthescenes",
  "essay": "featurette",
  "featurette": "featurette",
  "interview": "interview",
  "montage": "featurette",
  "music video": "short",
  "outtakes": "deleted",
  "promotional": "trailer",
  "q&a": "interview",
  "short": "short",
  "sing": "short",
  "song": "short",
  "story": "short",
  "trailer": "trailer",
}

export const parseSpecialFeatures = (
  specialFeatureText: string,
): (
  Observable<
    SpecialFeature[]
  >
) => (
  from(
    specialFeatureText
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
      text: (
        lineItem
        .trim()
      ),
    })),
    map(({
      text,
      ...otherProps
    }) => {
      const matches = (
        text
        .match(
          /\(.*?(\d+:\d+)\)/
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
                / \(.*?\d+:\d+\)/,
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
              specialFeatureMatchKeys
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
              specialFeatureMatchTypes[
                extraMatchKey
                .toLowerCase() as (
                  SpecialFeatureMatchKey
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
        SpecialFeature[]
      ),
    ),
    catchNamedError(
      parseSpecialFeatures
    ),
  )
)
