import {
  concatMap,
  filter,
  map,
  of,
  reduce,
} from "rxjs"

import { convertIso6391ToIso6392 } from "./convertIso6391ToIso6392.js"
import { deduplicateWhileMaintainingOrder } from "./deduplicateWhileMaintainingOrder.js"
import {
  getMediaInfo,
  type AudioTrack,
  type TextTrack,
} from "./getMediaInfo.js"
import { type Iso6391LanguageCode } from "./iso6391LanguageCodes.js"

export type TrackTypeLanguages = (
  Record<
    (
      | AudioTrack["@type"]
      | TextTrack["@type"]
      | string
    ),
    Iso6391LanguageCode[]
  >
)

export const getTrackLanguages = (
  filePath: string,
) => (
  getMediaInfo(
    filePath
  )
  .pipe(
    filter(
      Boolean
    ),
    map(({
      media,
    }) => (
      media
    )),
    filter(
      Boolean
    ),
    concatMap(({
      track,
    }) => (
      track
    )),
    filter((
      track,
    ): track is (
      | AudioTrack
      | TextTrack
    ) => (
      (
        (
          track
          ["@type"]
        )
        === "Audio"
      )
      || (
        (
          track
          ["@type"]
        )
        === "Text"
      )
    )),
    filter((
      track,
    ): track is (
      | AudioTrack
      | TextTrack
    ) => (
      Boolean(
        track
        .Language
      )
    )),
    reduce(
      (
        trackInfos,
        track
      ) => ({
        ...trackInfos,
        [
          track
          ["@type"]
        ]: [
          ...(
            trackInfos[
              track
              ["@type"]
            ]
          ),
          ...(
            trackInfos[
              track
              ["@type"]
            ]
            .includes(
              track
              .Language!
            )
            ? []
            : [
              track
              .Language!
            ]
          ),
        ]
      }),
      {
        Audio: [],
        Text: [],
      } satisfies (
        TrackTypeLanguages
      ) as (
        TrackTypeLanguages
      ),
    ),
    map(({
      Audio,
      Text,
    }) => ({
      audioLanguages: (
        deduplicateWhileMaintainingOrder(
          Audio
        )
        .map((
          iso6391LanguageCode,
        ) => (
          convertIso6391ToIso6392(
            iso6391LanguageCode
          )
        ))
      ),
      subtitlesLanguages: (
        deduplicateWhileMaintainingOrder(
          Text
        )
        .map((
          iso6391LanguageCode,
        ) => (
          convertIso6391ToIso6392(
            iso6391LanguageCode
          )
        ))
      ),
    })),
  )
)
