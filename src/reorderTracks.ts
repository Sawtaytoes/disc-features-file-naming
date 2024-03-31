import {
  concatAll,
  filter,
  map,
  mergeAll,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"
import { reorderTracksFfmpeg } from "./reorderTracksFfmpeg.js"
import { reorderTracksMkvMerge } from "./reorderTracksMkvMerge.js"

export const reorderTracks = ({
  audioTrackIndexes,
  isRecursive,
  sourcePath,
  subtitlesTrackIndexes,
  videoTrackIndexes,
}: {
  audioTrackIndexes: number[]
  isRecursive: boolean
  sourcePath: string
  subtitlesTrackIndexes: number[]
  videoTrackIndexes: number[]
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
      reorderTracksFfmpeg({
        audioTrackIndexes,
        filePath: (
          fileInfo
          .fullPath
        ),
        subtitlesTrackIndexes,
        videoTrackIndexes,
      })

      // To do this with `mkvmerge`, tracks need to be numbered sequentially from video to audio to subtitles. It's more complicated and not as easy to replicate.
      // Only use this if something is botched with `ffmpeg`.
      // reorderTracksMkvMerge({
      //   audioTrackIndexes,
      //   filePath: (
      //     fileInfo
      //     .fullPath
      //   ),
      //   subtitlesTrackIndexes,
      //   videoTrackIndexes,
      // })
    )),
    // ffmpeg -i input.mp4 -map 0 -c copy -map 0:a:1 -map 0:a:0 output.mp4
    concatAll(),
    toArray(),
    tap(() => {
      process
      .exit()
    }),
    catchNamedError(
      reorderTracks
    ),
  )
)
