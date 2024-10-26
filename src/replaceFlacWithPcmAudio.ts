import {
  concatAll,
  concatMap,
  filter,
  map,
  mergeAll,
  of,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { convertFlacToPcmAudio } from "./convertFlacToPcmAudio.js"
import { filterIsVideoFile } from "./filterIsVideoFile.js"
import {
  getMediaInfo,
  type AudioTrack,
} from "./getMediaInfo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"
import { logInfo } from "./logMessage.js"

export const replaceFlacWithPcmAudio = ({
  isRecursive,
  sourcePath,
}: {
  isRecursive: boolean
  sourcePath: string
}) => (
  readFilesAtDepth({
    depth: (
      isRecursive
      ? 1
      : 0
    ),
    sourcePath,
  })
  .pipe(
    filterIsVideoFile(),
    map((
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
        filter((
          track,
        ): track is AudioTrack => (
          (
            (
              track
              ["@type"]
            )
            === "Audio"
          )
        )),
        concatMap((
          track,
          index,
        ) => (
          of({
            audioTrackIndex: (
              index
            ),
            bitDepth: (
              track
              .BitDepth!
            ),
          })
          .pipe(
            filter(() => (
              (
                track
                .Format
              )
              === "FLAC"
            )),
          )
        )),
        toArray(),
        concatMap((
          audioTrackInfos,
        ) => (
          convertFlacToPcmAudio({
            audioTrackInfos,
            filePath: (
              fileInfo
              .fullPath
            ),
          })
        )),
      )
      .pipe(
        tap(() => {
          logInfo(
            "CREATED PCM AUDIO CONVERSION FILE",
            (
              fileInfo
              .fullPath
            ),
          )
        }),
        filter(
          Boolean
        ),
      )
    )),
    concatAll(),
    toArray(),
    tap(() => {
      process
      .exit()
    }),
    catchNamedError(
      replaceFlacWithPcmAudio
    ),
  )
)
