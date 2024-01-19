import chalk from "chalk"
import {
  concatAll,
  concatMap,
  filter,
  map,
  mergeAll,
  tap,
  toArray,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { getIsVideoFile } from "./getIsVideoFile.js"
import { getTrackLanguages } from "./getTrackLanguages.js"
import { Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { keepSpecifiedLanguageTracks } from "./keepSpecifiedLanguageTracks.js"
import { readFilesAtDepth } from "./readFilesAtDepth.js"

export const keepLanguages = ({
  audioLanguages: selectedAudioLanguages,
  isRecursive,
  hasFirstAudioLanguage,
  hasFirstSubtitlesLanguage,
  sourcePath,
  subtitlesLanguages: selectedSubtitlesLanguages,
}: {
  audioLanguages: Iso6392LanguageCode[]
  hasFirstAudioLanguage: boolean
  hasFirstSubtitlesLanguage: boolean
  isRecursive: boolean
  sourcePath: string
  subtitlesLanguages: Iso6392LanguageCode[]
}) => (
  readFilesAtDepth({
    depth: (
      isRecursive
      ? 1
      : 0
    ),
    sourcePath,
  })
  .pipe(
    mergeAll(),
    filter((
      fileInfo
    ) => (
      getIsVideoFile(
        fileInfo
        .fullPath
      )
    )),
    map((
      fileInfo,
    ) => (
      getTrackLanguages(
        fileInfo
        .fullPath
      )
      .pipe(
        map(({
          audioLanguages,
          ...otherProps
        }) => ({
          ...otherProps,
          audioLanguages,
          hasMatchingAudioLanguage: (
            selectedAudioLanguages
            .some((
              selectedAudioLanguage,
            ) => (
              audioLanguages
              .includes(
                selectedAudioLanguage
              )
            ))
          ),
        })),
        map(({
          audioLanguages,
          hasMatchingAudioLanguage,
          subtitlesLanguages,
        }) => ({
          audioLanguages,
          audioLanguagesToKeep: [
            ...selectedAudioLanguages,
            ...(
              (
                hasFirstAudioLanguage
                && (
                  (
                    audioLanguages
                    .length
                  )
                  > 0
                )
              )
              ? [
                audioLanguages
                .at(0)
              ]
              : (
                hasMatchingAudioLanguage
                ? []
                : audioLanguages
              )
            ),
          ],
          subtitlesLanguages,
          subtitlesLanguagesToKeep: [
            ...selectedSubtitlesLanguages,
            ...(
              (
                hasFirstSubtitlesLanguage
                && (
                  (
                    subtitlesLanguages
                    .length
                  )
                  > 0
                )
              )
              ? [
                subtitlesLanguages
                .at(0)
              ]
              : []
            ),
          ],
        })),
        // tap(({
        //   audioLanguages,
        //   audioLanguagesToKeep,
        //   subtitlesLanguages,
        //   subtitlesLanguagesToKeep,
        // }) => {
        //   console.log({
        //     audioLanguages,
        //     audioLanguagesToKeep,
        //     subtitlesLanguages,
        //     subtitlesLanguagesToKeep,
        //   })
        //   console.log(
        //     audioLanguages
        //     .some((
        //       audioLanguage,
        //     ) => (
        //       !(
        //         audioLanguagesToKeep
        //         .includes(
        //           audioLanguage
        //         )
        //       )
        //     ))
        //   )
        //   console.log(
        //     subtitlesLanguages
        //     .some((
        //       subtitlesLanguage,
        //     ) => (
        //       !(
        //         subtitlesLanguagesToKeep
        //         .includes(
        //           subtitlesLanguage
        //         )
        //       )
        //     ))
        //   )
        // }),
        filter(({
          audioLanguages,
          audioLanguagesToKeep,
          subtitlesLanguages,
          subtitlesLanguagesToKeep,
        }) => (
          // Only continue if there's keeping languages results in a different file output.
          (
            audioLanguages
            .some((
              audioLanguage,
            ) => (
              !(
                audioLanguagesToKeep
                .includes(
                  audioLanguage
                )
              )
            ))
          )
          || (
            subtitlesLanguages
            .some((
              subtitlesLanguage,
            ) => (
              !(
                subtitlesLanguagesToKeep
                .includes(
                  subtitlesLanguage
                )
              )
            ))
          )
        )),
        concatMap(({
          audioLanguagesToKeep,
          subtitlesLanguagesToKeep,
        }) => (
          keepSpecifiedLanguageTracks({
            audioLanguages: (
              audioLanguagesToKeep
              .filter(
                Boolean
              )
            ),
            filePath: (
              fileInfo
              .fullPath
            ),
            subtitlesLanguages: (
              subtitlesLanguagesToKeep
              .filter(
                Boolean
              )
            ),
          })
          .pipe(
            tap(() => {
              console
              .info(
                (
                  chalk
                  .green(
                    "[CREATED TRIMMED FILE]"
                  )
                ),
                (
                  fileInfo
                  .fullPath
                ),
                "\n",
                "\n",
              )
            }),
            filter(
              Boolean
            ),
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
      keepLanguages
    ),
  )
)
