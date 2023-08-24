import {
  concatMap,
  EMPTY,
  filter,
  map,
  mergeAll,
  mergeMap,
  of,
  reduce,
  tap,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getArgValues } from "./getArgValues.js"
import {
  getMediaInfo,
  type AudioTrack,
} from "./getMediaInfo.js"
import { readFiles } from "./readFiles.js"
import { readFolders } from "./readFolders.js"

const {
  parentDirectory,
} = (
  getArgValues()
)

export const hasBetterAudio = () => (
  // readFolders({
  //   parentDirectory,
  // })
  // .pipe(
  //   mergeAll(),
  //   mergeMap((
  //     folderInfo,
  //   ) => (
  //     readFiles({
  //       parentDirectory: (
  //         folderInfo
  //         .fullPath
  //       )
  //     })
  //   )),
  readFiles({
    parentDirectory,
  })
  .pipe(
    mergeAll(),
    mergeMap((
      fileInfo,
    ) => (
      getMediaInfo(
        fileInfo
        .fullPath
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
        concatMap((
          track,
        ) => (
          (
            (
              track
              ["@type"]
            )
            === "Audio"
          )
          ? (
            of(
              track
            )
          )
          : EMPTY
        )),
        map((
          track,
        ) => {
          if (
            (
              track
              .ChannelLayout
            )
            || (
              track
              .ChannelLayout_Original
            )
          ) {
            return {
              channelCount: (
                (
                  (
                    track
                    .ChannelLayout_Original
                  )
                  || (
                    track
                    .ChannelLayout
                  )
                )
                .split(' ')
                .length
              ),
              track,
            }
          }

          if (
            track
            .Channels
          ) {
            return {
              channelCount: (
                Number(
                  track
                  .Channels
                )
              ),
              track,
            }
          }

          return {
            channelCount: 1,
            track,
          }
        }),
        reduce(
          (
            selectedValue,
            value,
            index,
          ) => (
            (
              (
                selectedValue
                .channelCount
              )
              >= (
                value
                .channelCount
              )
            )
            ? selectedValue
            : {
              ...value,
              index,
            }
          ),
          {
            channelCount: 0,
            index: -1,
            track: {}
          } as {
            channelCount: number
            index: number,
            track: AudioTrack
          }
        ),
        filter(({
          channelCount
        }) => (
          channelCount
          > 0
        )),
        filter(({
          index,
        }) => (
          index
          > 0
        )),
        tap(({
          channelCount,
          track,
        }) => {
          console
          .info(
            (
              fileInfo
              .fullPath
            ),
            "\n",
            channelCount,
            track,
          )
        }),
      )
    )),
    catchNamedError(
      hasBetterAudio
    ),
  )
)

hasBetterAudio()
.subscribe()
