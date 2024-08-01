import { sep } from "node:path";
import {
  concatMap,
  map,
  of,
} from "rxjs";

import { addFolderNameBeforeFilename } from "./addFolderNameBeforeFilename.js";
import { type Iso6392LanguageCode } from "./iso6392LanguageCodes.js";
import { replaceFileExtension } from "./replaceFileExtension.js";
import { runMkvExtract } from "./runMkvExtract.js";

export const extractedPath = "EXTRACTED-SUBTITLES"

export const subtitleCodecExtension = {
  "S_TEXT/ASS": "ass",
  "S_TEXT/UTF8": "srt",
}

export const extractSubtitles = ({
  codec_id,
  filePath,
  languageCode,
  trackId,
}: {
  codec_id: keyof typeof subtitleCodecExtension
  filePath: string
  languageCode: Iso6392LanguageCode,
  trackId: number,
}) => (
  of(
    addFolderNameBeforeFilename({
      filePath,
      folderName: extractedPath,
    })
  )
  .pipe(
    map((
      outputFilePath,
    ) => (
      replaceFileExtension({
        filePath: outputFilePath,
        fileExtension: (
          sep
          .concat(
            `track${trackId}`,
            ".",
            languageCode,
            ".",
            (
              subtitleCodecExtension
              [codec_id]
            ),
          )
        ),
      })
    )),
    concatMap((
      outputFilePath,
    ) => (
      runMkvExtract({
        args: [
          "tracks",
          filePath,
          `${trackId}:${outputFilePath}`,
        ],
        outputFilePath,
      })
      .pipe(
        map(() => (
          outputFilePath
        )),
      )
    )),
  )
)
