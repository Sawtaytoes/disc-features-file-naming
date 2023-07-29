export const formatResolutionName = ({
  height,
  width,
}: {
  height: string,
  width: string,
}) => {
  if (
    Number(width) >= 3800
    && Number(width) <= 4100
  ) {
    if (
      Number(height) >= 2156
      && Number(height) <= 2160
    ) {
      return '4K'
    }

    return '4K'.concat(' ', (Number(width)/Number(height)).toFixed(2))
  }

  if (
    width === '1920'
  ) {
    if (
      Number(height) >= 1076
      && Number(height) <= 1086
    ) {
      return 'FHD'
    }

    return 'FHD'.concat(' ', (Number(width)/Number(height)).toFixed(2))
  }

  if (
    width === '1440'
    && height === '1080'
  ) {
    return 'FHD'
  }

  if (
    width === '1280'
  ) {
    if (height === '720') {
      return 'HD'
    }
  }

  if (
    Number(height) >= 1438
    && Number(height) <= 1440
  ) {
    return 'QHD'
  }

  if (
    height === '480'
    || height === '576'
  ) {
    if (width === '720') {
      return 'SD'
    }

    return 'SD'.concat(' ', (Number(width)/Number(height)).toFixed(2))
  }

  if (
    Number(height) >= 360
    && Number(height) <= 420
  ) {
    return 'nHD'.concat(' ', (Number(width)/Number(height)).toFixed(2))
  }

  console.log({height, width, dar: Number(width)/Number(height)})

  return width.concat('x', height)
}

export const replaceResolutionName = ({
  filename,
  height,
  width,
}: {
  filename: string,
  height: string,
  width: string,
}) => (
  filename
  .replace(
    /(.+){(IMAX )?.+? (.+)( & .+})/,
    '$1'
    .concat(
      "{$2",
      (
        formatResolutionName({
          height,
          width,
        })
      ),
      ' $3$4',
    )
  )
)
