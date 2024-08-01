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

export const extractSubtitles = ({
  filePath,
  languageCode,
  trackId,
}: {
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
            "ass",
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
