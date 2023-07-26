import {
  execFile as execFileCallback,
} from "node:child_process";
import {
  promisify,
} from "node:util"
import {
  from,
  map,
  tap,
  type Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"

const execFile = (
  promisify(
    execFileCallback
  )
)

export type Chapter = {
  num_entries: number
}

export type ContainerProperties = {
  container_type: number
  date_local: string
  date_utc: string
  duration: number
  is_providing_timestamps: boolean
  muxing_application: string
  segment_uid: string
  title: string
  writing_application: string
}

export type Container = {
  properties: ContainerProperties
  recognized: boolean
  supported: boolean
  type: string
}

export type TrackProperties = {
  codec_id: string
  codec_private_data?: string
  codec_private_length: number
  default_duration?: number
  default_track: boolean
  display_dimensions?: string
  display_unit?: number
  enabled_track: boolean
  forced_track: boolean
  language: string
  minimum_timestamp?: number
  num_index_entries: number
  number: number
  packetizer?: string
  pixel_dimensions?: string
  uid: number
  audio_channels?: number
  audio_sampling_frequency?: number
  track_name?: string
  audio_bits_per_sample?: number
}

export type Track = {
  codec: string
  id: number
  properties: TrackProperties
  type: string
}

export type MkvInfo = {
  attachments: any[]
  chapters: Chapter[]
  container: Container
  errors: any[]
  file_name: string
  global_tags: any[]
  identification_format_version: number
  track_tags: any[]
  tracks: Track[]
  warnings: any[]
}

export const getMkvInfo = (
  filePath: string,
): (
  Observable<
    MkvInfo
  >
) => (
  from(
    execFile(
      "mkvtoolnix-64-bit-78.0.7/mkvmerge.exe",
      [
        "--identification-format",
        "json",

        "--identify",
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
      mkvInfoJsonString,
    ) => (
      JSON
      .parse(
        mkvInfoJsonString
      ) as (
        MkvInfo
      )
    )),
    catchNamedError(
      getMkvInfo
    ),
  )
)
