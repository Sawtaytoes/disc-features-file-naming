import { writeFile } from 'node:fs/promises'
import generateTypescriptFromOpenapiSchema from 'openapi-typescript'

import { tvdbApiSchemaUrl } from './tvdbApi.js'

const generateSchemas = () => (
  generateTypescriptFromOpenapiSchema(
    tvdbApiSchemaUrl,
    {
      transform: (
        schemaObject,
        metadata,
      ) => {
        if (
          "format" in schemaObject
          && (
            (
              schemaObject
              .format
            )
            === "binary"
          )
        ) {
          return (
            (
              schemaObject
              .nullable
            )
            ? "Blob | null"
            : "Blob"
          )
        }
      },
    }
  )
  .then((
    schema,
  ) => (
    writeFile(
      './src/schema.generated/tvdb.ts',
      schema,
    )
  ))
  .then(() => {
    console
    .log(
      "Updated schemas."
    )
  })
  .catch((
    error,
  ) => {
    console
    .error(
      error
    )
  })
)

generateSchemas()
