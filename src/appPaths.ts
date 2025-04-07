import { platform } from "node:os"

const isWindows = platform() === 'win32'

export const topazFfmpeg = {
  envVars: {
    TVAI_MODEL_DATA_DIR: "C:\\ProgramData\\Topaz Labs LLC\\Topaz Video AI\\models\\",
    TVAI_MODEL_DIR: "C:\\ProgramData\\Topaz Labs LLC\\Topaz Video AI\\models",
  },
  ffmpegPath: "C:\\Program Files\\Topaz Labs LLC\\Topaz Video AI\\ffmpeg.exe",
}

/** @see https://github.com/bbc/audio-offset-finder */
// export const audioOffsetFinderPath = ".venv/bin/audio-offset-finder" .// This local version doesn't run for whatever reason.
export const audioOffsetFinderPath = "audio-offset-finder"

export const ffmpegPath = (
  isWindows
  ? "apps.generated/ffmpeg-7.0.2-essentials_build/bin/ffmpeg.exe"
  : "ffmpeg"
)

export const mediaInfoPath = (
  isWindows
  ? "apps.generated/MediaInfo_CLI_25.03_Windows_x64/MediaInfo.exe"
  : "mediainfo"
)

export const mkvExtractPath = (
  isWindows
  ? "apps.generated/mkvtoolnix-64-bit-91.0/mkvextract.exe"
  : "mkvextract"
)

export const mkvMergePath = (
  isWindows
  ? "apps.generated/mkvtoolnix-64-bit-91.0/mkvmerge.exe"
  : "mkvmerge"
)

export const mkvPropEditPath = (
  isWindows
  ? "apps.generated/mkvtoolnix-64-bit-91.0/mkvpropedit.exe"
  : "mkvpropedit"
)
