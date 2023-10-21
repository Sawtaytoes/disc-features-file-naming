import {
  dirname,
  join,
} from "node:path"

import { runFfmpeg } from "./runFfmpeg.js";
// import { runMkvPropEdit } from "./runMkvPropEdit.js";

export const mergedPath = "MERGED"

export const mergeTracksFfmpeg = ({
  attachmentFilePaths,
  destinationFilePath,
  fileSizeInKilobytes,
  inputFilePaths,
  // offsetInMilliseconds,
}: {
  attachmentFilePaths?: string[]
  destinationFilePath: string
  fileSizeInKilobytes: number
  inputFilePaths: string[]
  // offsetInMilliseconds?: number
}) => (
  runFfmpeg({
    args: [
      "-c:v",
      "copy",

      "-c:a",
      "copy",

      "-c:s",
      "copy",

      "-c:d",
      "copy",
    ],
    attachmentFilePaths,
    fileSizeInKilobytes,
    inputFilePaths,
    outputFilePath: (
      destinationFilePath
      .replace(
        (
          dirname(
            destinationFilePath
          )
        ),
        (
          join(
            (
              dirname(
                destinationFilePath
              )
            ),
            mergedPath,
          )
        ),
      )
    )
  })
)
