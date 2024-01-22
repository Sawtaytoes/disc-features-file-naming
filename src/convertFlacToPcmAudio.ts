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
import { replaceFileExtension } from "./replaceFileExtension.js";
import { runFfmpeg } from "./runFfmpeg.js";

export const convertedPath = "AUDIO-CONVERTED"

export const convertFlacToPcmAudio = ({
  audioTrackIndex,
  bitDepth,
  filePath,
}: {
  audioTrackIndex: number
  bitDepth: string
  filePath: string
}) => (
  of(
    addFolderNameBeforeFilename({
      filePath,
      folderName: convertedPath,
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
          outputFilePath
        )),
      )
    )),
    concatMap((
      outputFilePath,
    ) => (
      runFfmpeg({
        args: [
          "-c",
          "copy",

          "-map",
          "0",

          `-c:a:${audioTrackIndex}`,
          `pcm_s${bitDepth}le`,

          `-y`,
        ],
        inputFilePaths: [
          filePath
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
