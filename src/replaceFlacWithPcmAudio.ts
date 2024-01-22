import chalk from "chalk"
import {
  concatAll,
  concatMap,
  filter,
  map,
  mergeAll,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { cpus } from "node:os"
import { convertFlacToPcmAudio } from "./convertFlacToPcmAudio.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import {
  getMediaInfo,
  type AudioTrack,
} from "./getMediaInfo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

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
    mergeAll(),
    filter((
      fileInfo
    ) => (
      getIsVideoFile(
        fileInfo
        .fullPath
      )
    )),
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
          && (
            (
              track
              .Format
            )
            === "FLAC"
          )
        )),
        concatMap((
          track,
          index,
        ) => (
          convertFlacToPcmAudio({
            audioTrackIndex: (
              index
            ),
            bitDepth: (
              track
              .BitDepth!
            ),
            filePath: (
              fileInfo
              .fullPath
            ),
          })
        )),
        tap(() => {
          console
          .info(
            (
              chalk
              .green(
                "[CREATED PCM AUDIO CONVERSION FILE]"
              )
            ),
            (
              fileInfo
              .fullPath
            ),
            "\n",
            "\n",
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
