import colors from "ansi-colors"
import chalk from "chalk"
import cliProgress from "cli-progress"
import {
  spawn,
} from "node:child_process";
import {
  unlink,
} from "node:fs/promises"
import {
  Observable,
} from "rxjs"

import { catchNamedError } from "./catchNamedError.js"
import { Iso6392LanguageCode } from "./Iso6392LanguageCode.js"
import { runMkvMerge } from "./runMkvMerge.js";

export const languageTrimmedText = "[LANGUAGE-TRIMMED]"

export const keepSpecifiedLanguageTracks = ({
  audioLanguage,
  filePath,
  subtitleLanguage,
}: {
  audioLanguage: Iso6392LanguageCode,
  filePath: string,
  subtitleLanguage: Iso6392LanguageCode,
}): (
  Observable<
    string
  >
) => (
  runMkvMerge({
    args: [
      "--audio-tracks",
      audioLanguage,

      "--subtitle-tracks",
      subtitleLanguage,

      filePath,
    ],
    outputFilePath: (
      filePath
      .replace(
        /(\..+)/,
        ` ${languageTrimmedText}$1`,
      )
    )
  })
  .pipe(
    catchNamedError(
      keepSpecifiedLanguageTracks
    ),
  )
)
