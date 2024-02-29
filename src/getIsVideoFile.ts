import { extname } from "node:path"

export const videoFileExtensions = (
  new Set([
    ".avi",
    ".m2ts",
    ".mkv",
    ".mp4",
    ".ogm",
    ".ts",
  ])
)

export const getIsVideoFile = (
  sourceFilePath: string
) => (
  videoFileExtensions
  .has(
    extname(
      sourceFilePath
    )
  )
)
