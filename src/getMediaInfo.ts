import {
  execFile as execFileCallback,
} from "node:child_process";
import {
  promisify,
} from "node:util"
import {
  from,
  map,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

const execFile = (
  promisify(
    execFileCallback
  )
)

type Track = {
  "@type": string,
  "@typeorder": string,
  "BitDepth": string,
  "ChannelLayout_Original": string,
  "ChannelLayout": string,
  "ChannelPositions": string,
  "Channels": string,
  "colour_primaries": string,
  "DisplayAspectRatio": string,
  "Duration": string,
  "extra": (
    Record<
      string,
      string
    >
  ),
  "Format_AdditionalFeatures": string,
  "Format_Commercial_IfAny": string,
  "Format_Commercial": string,
  "Format_Settings_Mode": string,
  "Format": string,
  "Format/Info": string,
  "HDR_Format_Compatibility"?: string,
  "HDR_Format"?: string,
  "Height": string,
  "Title": string,
  "transfer_characteristics"?: string,
  "Width": string,
}

export type MediaInfo = {
  media: (
    | {
      "@ref": string,
      track: Track[],
    }
    | null
  ),
}

export const getMediaInfo = (
  filePath: string,
): (
  Observable<
    MediaInfo
  >
) => (
  from(
    execFile(
      "MediaInfo_CLI_23.07_Windows_x64/MediaInfo.exe",
      [
        "--Output=JSON",
        filePath,
      ],
    )
  )
  .pipe(
    map(({
      stderr,
      stdout,
    }) => {
      if (
        stderr
      ) {
        throw stderr
      }

      return stdout
    }),
    map((
      mediaInfoJsonString,
    ) => (
      JSON
      .parse(
        mediaInfoJsonString
      ) as (
        MediaInfo
      )
    )),
    catchNamedError(
      getMediaInfo
    ),
  )
)
