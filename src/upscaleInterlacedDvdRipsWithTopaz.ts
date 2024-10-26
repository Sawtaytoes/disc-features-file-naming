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
import { filterIsVideoFile } from "./filterIsVideoFile.js"
import {
  inverseTelecineVideo,
  type Pulldown,
} from "./inverseTelecineVideo.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"
import {
  upscaleInterlacedDvdWithTopaz,
  type VideoAiEnhancement,
} from "./upscaleInterlacedDvdWithTopaz.js"

export const upscaleInterlacedDvdRipsWithTopaz = ({
  isConstantBitrate,
  isRecursive,
  sourcePath,
  pulldown,
  videoAiEnhancementType,
}: {
  isConstantBitrate: boolean
  isRecursive: boolean
  sourcePath: string
  pulldown: Pulldown,
  videoAiEnhancementType: VideoAiEnhancement
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
    filterIsVideoFile(),
    map((
      fileInfo,
    ) => (
      (
        isConstantBitrate
        ? (
          of(
            fileInfo
            .fullPath
          )
        )
        : (
          // DVDs have variable framerate, so you first need to set it to Constant in the video track before performing an inverse telecine.
          convertVariableToConstantBitrate({
            filePath: (
              fileInfo
              .fullPath
            ),
            framesPerSecond: "24000/1001",
          })
        )
      )
      .pipe(
        concatMap((
          filePath,
        ) => (
          inverseTelecineVideo({
            filePath,
            pulldown,
            videoEncoder: "gpu-nvidia",
          })
        )),
        concatMap((
          filePath,
        ) => (
          upscaleInterlacedDvdWithTopaz({
            filePath,
            videoAiEnhancementType,
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
      upscaleInterlacedDvdRipsWithTopaz
    ),
  )
)
