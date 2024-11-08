import {
  execFile,
} from "node:child_process";
import {
  defer,
  map,
  Observable,
} from "rxjs"

import { mkvMergePath } from "./appPaths.js";
import { catchNamedError } from "./catchNamedError.js"

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
  audio_bits_per_sample?: number
  audio_channels?: number
  audio_sampling_frequency?: number
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
  track_name?: string
  uid: number
}

export type MkvTookNixTrackType = (
  | "audio"
  | "subtitles"
  | "video"
)

export type Track = {
  codec: string
  id: number
  properties: TrackProperties
  type: MkvTookNixTrackType
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

type ExecFileParameters = Parameters<typeof execFile>

export const createExecFileObservable = ({
  appExecutablePath,
  args,
  options,
}: {
  appExecutablePath: ExecFileParameters[0]
  args: ExecFileParameters[1]
  options?: ExecFileParameters[2]
}) => (
  new Observable<
    string
  >((
    subscriber,
  ) => {
    execFile(
      appExecutablePath,
      args,
      options,
      (
        error,
        stdout,
        stderr,
      ) => {
      if (
        error
      ) {
        subscriber
        .error(
          error
        )
      }
      else if (
        stderr
      ) {
        subscriber
        .error(
          new Error(
            stderr
            .toString()
          )
        )
      }
      else {
        subscriber
        .next(
          stdout
          .toString()
        )

        subscriber
        .complete()
      }
    })
  })
)

export const getMkvInfo = (
  filePath: string,
): (
  Observable<
    MkvInfo
  >
) => (
  defer(() => (
    createExecFileObservable({
      appExecutablePath: mkvMergePath,
      args: [
        "--identification-format",
        "json",

        "--identify",
        `${filePath}`,
      ],
    })
  ))
  .pipe(
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
