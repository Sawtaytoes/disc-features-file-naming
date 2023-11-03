import {
  Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js"
import { runMkvMerge } from "./runMkvMerge.js";
import { dirname, join } from "node:path";

export const languageTrimmedFolderName = "LANGUAGE-TRIMMED"

export const keepSpecifiedLanguageTracks = ({
  audioLanguages,
  filePath,
  subtitlesLanguages,
}: {
  audioLanguages: Iso6392LanguageCode[],
  filePath: string,
  subtitlesLanguages: Iso6392LanguageCode[],
}): (
  Observable<
    string
  >
) => (
  runMkvMerge({
    args: [
      "--audio-tracks",
      (
        audioLanguages
        .join(",")
      ),

      "--subtitle-tracks",
      (
        subtitlesLanguages
        .join(",")
      ),

      filePath,
    ],
    outputFilePath: (
      filePath
      .replace(
        (
          dirname(
            filePath
          )
        ),
        (
          join(
            (
              dirname(
                filePath
              )
            ),
            languageTrimmedFolderName,
          )
        ),
      )
    )
  })
  .pipe(
    catchNamedError(
      keepSpecifiedLanguageTracks
    ),
  )
)
