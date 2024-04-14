import {
  mkdir,
} from "node:fs/promises"
import {
  dirname,
} from "node:path"
import {
  concatMap,
  from,
  map,
  of,
} from "rxjs";

import { addFolderNameBeforeFilename } from "./addFolderNameBeforeFilename.js";
import { topazFfmpeg } from "./appPaths.js";
import { runFfmpeg } from "./runFfmpeg.js";

export const upscaledPath = "UPSCALED"

export const videoAiEnhancement = {
  "minimal": {
    filter: "tvai_up=model=gcg-5:scale=0:w=1620:h=1080:device=0:vram=1:instances=1,scale=w=1620:h=1080:flags=lanczos:threads=0:out_color_matrix=bt709",
    metadata: "videoai=Enhanced using gcg-5. Changed resolution to 1620x1080",
  },
  "sharpen": {
    filter: "tvai_up=model=prob-4:scale=0:w=1620:h=1080:preblur=0.1:noise=0:details=0.04:halo=0.2:blur=0.04:compression=0.08:device=0:vram=1:instances=1,scale=w=1620:h=1080:flags=lanczos:threads=0:out_color_matrix=bt709",
    metadata: "videoai=Enhanced using prob-4; mode: manual; revert compression at 8; recover details at 4; sharpen at 4; reduce noise at 0; dehalo at 10; anti-alias/deblur at 10; and focus fix Off. Changed resolution to 1620x1080",
  },
} as const

export type VideoAiEnhancement = keyof typeof videoAiEnhancement

export const upscaleInterlacedDvdWithTopaz = ({
  filePath,
  videoAiEnhancementType,
}: {
  filePath: string
  videoAiEnhancementType: VideoAiEnhancement,
}) => (
  of(
    addFolderNameBeforeFilename({
      filePath,
      folderName: upscaledPath,
    })
  )
  .pipe(
    concatMap((
      outputFilePath,
    ) => (
      from(
        mkdir(
          (
            dirname(
              outputFilePath
            )
          ),
          { recursive: true },
        )
      )
      .pipe(
        map(() => (
          outputFilePath.replaceAll("\\", "/")
        )),
      )
    )),
    concatMap((
      outputFilePath,
    ) => (
      runFfmpeg({
        ...topazFfmpeg,
        args: [
          "-sws_flags",
          "spline+accurate_rnd+full_chroma_int",

          "-color_trc",
          "2",

          "-colorspace",
          "2",

          "-color_primaries",
          "2",

          "-filter_complex",
          `${(
            videoAiEnhancement
            [videoAiEnhancementType]
            .filter
          )}`,

          // "-map",
          // "0:v",

          "-c:v",
          "hevc_nvenc",

          "-profile:v",
          "main",

          "-pix_fmt",
          "yuv420p",

          "-b_ref_mode",
          "disabled",

          "-tag:v",
          "hvc1",

          "-g",
          "30",

          "-preset",
          "p7",

          "-tune",
          "hq",

          "-rc",
          "constqp",

          "-qp",
          "17",

          "-rc-lookahead",
          "20",

          "-spatial_aq",
          "1",

          "-aq-strength",
          "15",

          "-b:v",
          "0",

          "-map",
          "0:a?",

          "-map_metadata:s:a:0",
          "0:s:a:0",

          "-c:a",
          "copy",

          "-map_metadata",
          "0",

          "-map_metadata:s:v",
          "0:s:v",

          "-fps_mode",
          "passthrough",

          "-map",
          "0:s?",

          "-c:s",
          "copy",

          "-movflags",
          "frag_keyframe+empty_moov+delay_moov+use_metadata_tags+write_colr",

          "-bf",
          "0",

          "-metadata",
          (
            videoAiEnhancement
            [videoAiEnhancementType]
            .metadata
          ),

          `-y`,
        ],
        inputFilePaths: [
          filePath.replaceAll("\\", "/")
        ],
        outputFilePath,
      })
      .pipe(
        map(() => (
          outputFilePath
        )),
      )
    )),
  )
)
