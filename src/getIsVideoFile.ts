import { extname } from "node:path"

export const videoFileExtensions = (
  new Set([
    ".m2ts",
    ".mkv",
    ".mp4",
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
