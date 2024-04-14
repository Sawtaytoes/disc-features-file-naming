import {
  concatAll,
  concatMap,
  filter,
  map,
  of,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { convertVariableToConstantBitrate } from "./convertVariableToConstantBitrate.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import {
  inverseTelecineVideo,
  type Pulldown,
  type VideoEncoder,
} from "./inverseTelecineVideo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const inverseTelecineDiscRips = ({
  isRecursive,
  isVariableBitrate,
  sourcePath,
  pulldown,
  videoEncoder,
}: {
  isRecursive: boolean
  isVariableBitrate: boolean
  sourcePath: string
  pulldown: Pulldown,
  videoEncoder: VideoEncoder,
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
    concatAll(),
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
      (
        isVariableBitrate
        ? (
          // DVDs have variable framerate, so you first need to set it to Constant in the video track before performing an inverse telecine.
          convertVariableToConstantBitrate({
            filePath: (
              fileInfo
              .fullPath
            ),
            framesPerSecond: "24000/1001",
          })
        )
        : (
          of(
            fileInfo
            .fullPath
          )
        )
      )
      .pipe(
        concatMap((
          filePath,
        ) => (
          inverseTelecineVideo({
            filePath,
            pulldown,
            videoEncoder,
          })
        )),
      )
    )),
    concatAll(),
    toArray(),
    tap(() => {
      process
      .exit()
    }),
    catchNamedError(
      inverseTelecineDiscRips
    ),
  )
)
