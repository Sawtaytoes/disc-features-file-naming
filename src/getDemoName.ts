import {
  catchError,
  EMPTY,
  filter,
  from,
  groupBy,
  map,
  merge,
  mergeMap,
  toArray,
  type Observable,
  of,
  reduce,
} from "rxjs"

import { replaceAudioFormatByChannelCount } from './audioHelpers.js'
import { catchNamedError } from "./catchNamedError.js"
import { MediaInfo } from "./getMediaInfo.js"
import { replaceHdrFormat } from './hdrHelpers.js'
import { replaceResolutionName } from './resolutionHelpers.js'

export const getDemoName = ({
  filename,
  mediaInfo,
}: {
  filename: string
  mediaInfo: MediaInfo
}): (
  Observable<
    string
  >
) => (
  from(
    (
      mediaInfo
      ?.media
      ?.track
    )
    || []
  )
  .pipe(
    filter((
      track,
    ) => (
      (
        (
          "@typeOrder" in (
            track
          )
        )
        && (
          (
            track
            ["@typeOrder"]
          )
          === "1"
        )
      )
      || !(
        "@typeOrder" in (
          track
        )
      )
    )),
    mergeMap((
      track
    ) => {
      if (
        (
          track
          ["@type"]
        )
        === "Audio"
      ) {
        return (
          of(track)
          .pipe(
            filter(() => (
              !(
                filename
                .includes(
                  "Auro-3D"
                )
              )
              && !(
                (
                  filename
                  .includes(
                    "Trinnov"
                  )
                )
                && (
                  filename
                  .includes(
                    "DTS-X"
                  )
                )
              )
            )),
            map(({
              "ChannelLayout": channelLayout,
              "ChannelLayout_Original": channelLayoutOriginal,
              "Channels": channels,
              "Format": format,
              "Format_AdditionalFeatures": formatAdditionalFeatures,
              "Format_Commercial": formatCommercial,
              "Format_Commercial_IfAny": formatCommercialIfAny,
              "Format_Settings_Mode": formatSettingsMode,
            }) => (
              (
                filename: string,
              ) => (
                replaceAudioFormatByChannelCount({
                  channelLayout: (
                    channelLayoutOriginal
                    || channelLayout
                  ),
                  channels,
                  filename,
                  formatAdditionalFeatures,
                  formatCommercial: (
                    formatCommercialIfAny
                    || formatCommercial
                    || format
                  ),
                  formatSettingsMode,
                })
              )
            )),
            catchNamedError(
              getDemoName
            ),
          )
        )
      }

      if (
        (
          track
          ["@type"]
        )
        === "Video"
      ) {
        return (
          of(track)
          .pipe(
            map(({
              "HDR_Format_Compatibility": hdrFormatCompatibility,
              "HDR_Format": hdrFormat,
              "Height": height,
              "transfer_characteristics": transferCharacteristics,
              "Width": width,
            }) => (
              (
                filename: string,
              ) => (
                replaceResolutionName({
                  filename: (
                    replaceHdrFormat({
                      filename,
                      hdrFormatCompatibility,
                      hdrFormat,
                      transferCharacteristics,
                    })
                  ),
                  height,
                  width,
                })
              )
            )),
          )
        )
      }

      return EMPTY
    }),
    reduce(
      (
        modifiedFilename,
        renamingFunction,
      ) => (
        renamingFunction(
          modifiedFilename
        )
      ),
      filename,
    ),
    catchNamedError(
      getDemoName
    ),
  )
)
