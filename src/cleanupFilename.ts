export const cleanupFilename = (
  filename: string,
) => (
  filename
  .replaceAll(
    /: /g,
    " - ",
  )
  .replaceAll(
    /:/g,
    "-",
  )
  .replaceAll(
    "?",
    "",
  )
  .replaceAll(
    "\"",
    "",
  )
  .replaceAll(
    "/",
    "-",
  )
  .replaceAll(
    "<",
    "[",
  )
  .replaceAll(
    ">",
    "]",
  )
  .replaceAll(
    "*",
    "@",
  )
)
