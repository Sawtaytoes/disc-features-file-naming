import chalk, {
  type ColorName,
  type BackgroundColorName,
  type ForegroundColorName,
} from "chalk"

export const createAddColorToChalk = (
  chalkColor: ColorName | undefined,
) => (
  chalkFunction: typeof chalk,
) => (
  (
    chalkColor
    && chalkColor in chalkFunction
  )
  ? (
    chalkFunction
    [chalkColor]
  )
  : chalkFunction
)

export const createLogMessage = ({
  logType,
  titleBackgroundColor,
  titleTextColor,
}: {
  logType: (
    | "error"
    | "info"
    | "warn"
  ),
  titleBackgroundColor?: BackgroundColorName
  titleTextColor?: ForegroundColorName
}) => (
  title: string,
  ...content: any[]
) => {
  const optionallyColoredChalk = (
    createAddColorToChalk(
      titleBackgroundColor
    )(
      createAddColorToChalk(
        titleTextColor
      )(
        chalk
      )
    )
  )

  console
  [logType](
    (
      optionallyColoredChalk(
        `[${title}]`
      )
    ),
    ...(
      content
      .slice(0, 2)
      .join("\n")
    ),
    ...(
      content
      .slice(2)
    ),
    "\n",
    "\n",
  )
}

export const logError = (
  createLogMessage({
    logType: "error",
    titleTextColor: "red",
  })
)

export const logInfo = (
  createLogMessage({
    logType: "info",
    titleTextColor: "green",
  })
)

export const logWarning = (
  createLogMessage({
    logType: "warn",
    titleBackgroundColor: "bgYellowBright",
    titleTextColor: "black",
  })
)
