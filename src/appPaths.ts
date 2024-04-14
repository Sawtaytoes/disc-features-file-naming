import pathToFfmpeg from "ffmpeg-static"

export const ffmpegPath = (
  String(
    pathToFfmpeg
  )
)

export const topazFfmpeg = {
  envVars: {
    TVAI_MODEL_DATA_DIR: "C:\\ProgramData\\Topaz Labs LLC\\Topaz Video AI\\models\\",
    TVAI_MODEL_DIR: "C:\\ProgramData\\Topaz Labs LLC\\Topaz Video AI\\models",
  },
  ffmpegPath: "C:\\Program Files\\Topaz Labs LLC\\Topaz Video AI\\ffmpeg.exe",
}

export const mediaInfoPath = "MediaInfo_CLI_24.03_Windows_x64/MediaInfo.exe"
export const mkvExtractPath = "mkvtoolnix-64-bit-83.0/mkvextract.exe"
export const mkvMergePath = "mkvtoolnix-64-bit-83.0/mkvmerge.exe"
export const mkvPropEditPath = "mkvtoolnix-64-bit-83.0/mkvpropedit.exe"
