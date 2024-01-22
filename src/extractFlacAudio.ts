import {
  concatMap,
  map,
  of,
} from "rxjs";

import { addFolderNameBeforeFilename } from "./addFolderNameBeforeFilename.js";
import { convertIso6391ToIso6392 } from "./convertIso6391ToIso6392.js";
import { type Iso6391LanguageCode } from "./iso6391LanguageCodes.js";
import { replaceFileExtension } from "./replaceFileExtension.js";
import { runMkvExtract } from "./runMkvExtract.js";

export const extractedPath = "TRACK-EXTRACTED"

export const extractFlacAudio = ({
  filePath,
  languageCode,
  trackId,
}: {
  filePath: string
  languageCode: Iso6391LanguageCode,
  trackId: string,
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
          convertIso6391ToIso6392(
            languageCode
          )
          .concat(
            ".flac"
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
