import {
  concatAll,
  concatMap,
  filter,
  from,
  map,
  mergeAll,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { extractSubtitles } from "./extractSubtitles.js"
import { filterIsVideoFile } from "./filterIsVideoFile.js"
import {
  getMkvInfo,
  type MkvTookNixTrackType,
} from "./getMkvInfo.js"
import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const copyOutSubtitles = ({
  audioLanguage: selectedAudioLanguage,
  isRecursive,
  sourcePath,
  subtitlesLanguage: selectedSubtitlesLanguage,
  videoLanguage: selectedVideoLanguage,
}: {
  audioLanguage?: Iso6392LanguageCode
  isRecursive: boolean
  sourcePath: string
  subtitlesLanguage?: Iso6392LanguageCode
  videoLanguage?: Iso6392LanguageCode
}) => {
  const trackTypeLanguageCode: (
    Record<
      MkvTookNixTrackType,
      (
        | Iso6392LanguageCode
        | undefined
      )
    >
  ) = {
    audio: selectedAudioLanguage,
    subtitles: selectedSubtitlesLanguage,
    video: selectedVideoLanguage,
  }

  return (
    readFilesAtDepth({
      depth: (
        isRecursive
        ? 1
        : 0
      ),
      sourcePath,
    })
    .pipe(
      filterIsVideoFile(),
      map((
        fileInfo,
      ) => (
        getMkvInfo(
          fileInfo
          .fullPath
        )
        .pipe(
          concatMap(({
            tracks
          }) => (
            from(
              tracks
            )
            .pipe(
              filter((
                track,
              ) => (
                Boolean(
                  trackTypeLanguageCode
                  [
                    track
                    .type
                  ]
                )
              )),
              concatMap((
                track,
              ) => (
                extractSubtitles({
                  codec_id: (
                    (
                      track
                      .properties
                      .codec_id
                    ) as (
                      Parameters<
                        typeof extractSubtitles
                      >[0]["codec_id"]
                    )
                  ),
                  filePath: (
                    fileInfo
                    .fullPath
                  ),
                  languageCode: (
                    trackTypeLanguageCode
                    [
                      track
                      .type
                    ]!
                  ),
                  trackId: (
                    (
                      track
                      .properties
                      .number
                    )
                    - 1
                  ),
                })
              )),
            )
          )),
        )
      )),
      concatAll(),
      toArray(),
      tap(() => {
        process
        .exit()
      }),
      catchNamedError(
        copyOutSubtitles
      ),
    )
  )
}
