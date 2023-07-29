export const formatCodecName = (
  codecName: string
) => {
  if (
    /with Dolby Atmos$/
    .test(
      codecName
    )
  ) {
    return (
      codecName
      .replace(
        /Dolby (.+) with Dolby Atmos/,
        'Dolby Atmos $1',
      )
    )
  }

  if (
    codecName
    .includes(
      '96/24'
    )
  ) {
    return 'DTS 96-24'
  }

  if (
    codecName
    .includes(
      'DTS-HD MA + IMAX Enhanced'
    )
  ) {
    return 'IMAX Enhanced DTS-X'
  }

  if (
    codecName
    .includes(
      'DTS-HD MA + DTS:X'
    )
  ) {
    return 'DTS-X'
  }

  if (
    codecName
    .includes(
      'DTS:X'
    )
  ) {
    return 'DTS-X'
  }

  if (
    codecName
    .includes(
      'DTS-HD Master Audio'
    )
  ) {
    return 'DTS-HD MA'
  }

  if (
    codecName
    .includes(
      'DTS-HD High Resolution Audio'
    )
  ) {
    return 'DTS-HD HRA'
  }

  if (
    codecName
    .includes(
      'DTS-HD High-Res Audio'
    )
  ) {
    return 'DTS-HD HRA'
  }

  return codecName
}

export const replaceAudioFormat = ({
  channelCount,
  codecName,
  filename,
}: {
  channelCount: string,
  codecName: string,
  filename: string,
}) => (
  filename
  .replace(
    /(.+) & .+}/,
    '$1'
    .concat(
      " & ",
      (
        formatCodecName(
          codecName
        )
      ),
      (
        channelCount
        ? (
          " "
          .concat(
            channelCount
          )
        )
        : ""
      ),
      '}',
    )
  )
)

export const replaceAudioFormatByChannelCount = ({
  channelLayout,
  channels,
  filename,
  formatAdditionalFeatures,
  formatCommercial,
  formatSettingsMode,
}: {
  channelLayout: string,
  channels: string,
  filename: string,
  formatAdditionalFeatures: string,
  formatCommercial: string,
  formatSettingsMode: string,
}) => {
  if (
    formatCommercial
    ?.includes('Atmos')
  ) {
    return (
      replaceAudioFormat({
        channelCount: '',
        codecName: (
          formatCommercial
          .replace(
            /Dolby (.+) with Dolby Atmos/,
            'Dolby Atmos $1'
          )
        ),
        filename,
      })
    )
  }

  if (
    formatSettingsMode === 'Dolby Surround'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '4.0',
        codecName: (
          formatCommercial
          .concat(
            ' Surround'
          )
        ),
        filename,
      })
    )
  }

  if (
    formatSettingsMode === 'Dolby Surround EX'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '7.1',
        codecName: 'Dolby Digital Surround EX',
        filename,
      })
    )
  }

  if (
    formatAdditionalFeatures === 'ES'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '6.1',
        codecName: 'DTS-ES HRA Matrix',
        filename,
      })
    )
  }

  if (
    formatAdditionalFeatures === 'ES XLL'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '6.1',
        codecName: 'DTS-ES MA Matrix',
        filename,
      })
    )
  }

  if (
    formatAdditionalFeatures === 'ES XCh XLL'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '6.1',
        codecName: 'DTS-ES MA Discrete',
        filename,
      })
    )
  }

  if (
    formatAdditionalFeatures === 'XLL X'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '',
        codecName: 'DTS-X',
        filename,
      })
    )
  }

  if (
    formatAdditionalFeatures === 'XLL X IMAX'
  ) {
    return (
      replaceAudioFormat({
        channelCount: '',
        codecName: 'IMAX Enhanced DTS-X',
        filename,
      })
    )
  }

  if (
    channelLayout
  ) {
    return (
      replaceAudioFormat({
        channelCount: (
          String(
            channelLayout
            .split(' ')
            .filter((
              channelName,
            ) => (
              channelName
              !== 'LFE'
            ))
            .length
          )
          .concat(
            '.',
            (
              (
                channelLayout
                ?.includes('LFE')
              )
              ? '1'
              : '0'
            ),
          )
        ),
        codecName: (
          formatCommercial
        ),
        filename,
      })
    )
  }

  if (
    channels
  ) {
    return (
      replaceAudioFormat({
        channelCount: (
          (
            (
              Number(
                channels
              )
            )
            >= 6
          )
          ? (
            String(
              Number(
                channels
              )
              - 1
            )
            .concat(
              ".1"
            )
          )
          : (
            String(
              Number(
                channels
              )
            )
            .concat(
              ".0"
            )
          )
        ),
        codecName: formatCommercial,
        filename,
      })
    )
  }

  return (
    replaceAudioFormat({
      channelCount: '2.0',
      codecName: formatCommercial,
      filename,
    })
  )
}
