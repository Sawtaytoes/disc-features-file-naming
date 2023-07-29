export const formatHdrName = ({
  hdrFormatCompatibility,
  hdrFormat,
  hdrFormatString,
  transferCharacteristics,
}: {
  hdrFormatCompatibility?: string,
  hdrFormat?: string,
  hdrFormatString?: string,
  transferCharacteristics?: string,
}) => (
  [
    (
      (
        (
          hdrFormatString
          || hdrFormat
        )
        ?.includes(
          'Dolby Vision'
        )
      )
      && 'DoVi'
    ),
    (
      (
        (
          (
            hdrFormatString
            || hdrFormat
          )
          ?.includes(
            'SMPTE ST 2094'
          )
        )
        || (
          hdrFormatCompatibility
          ?.includes(
            'HDR10+'
          )
        )
      )
      && 'HDR10+'
    ),
    (
      (
        transferCharacteristics
        ?.includes('HLG')
      )
      && 'HLG'
    ),
    (
      (
        (
          (
            hdrFormatString
            || hdrFormat
          )
          ?.includes(
            'SMPTE ST 2086'
          )
        )
        || (
          hdrFormatCompatibility
          === 'HDR10'
        )
        || (
          hdrFormatCompatibility
          ?.endsWith('HDR10')
        )
      )
      && 'HDR10'
    ),
  ]
  .filter(Boolean)
  .join(' ')
)

export const replaceHdrFormat = ({
  filename,
  hdrFormatCompatibility,
  hdrFormat,
  transferCharacteristics,
}: {
  filename: string,
  hdrFormatCompatibility?: string,
  hdrFormat?: string,
  transferCharacteristics?: string,
}) => (
  filename
  .replace(
    /(.+){(IMAX )?(.+?) .+( & .+})/,
    '$1{$2$3'
    .concat(
      " ",
      (
        formatHdrName({
          hdrFormatCompatibility,
          hdrFormat,
          transferCharacteristics,
        })
        || (
          (
            transferCharacteristics
            === 'PQ'
          )
          ? 'HDR10'
          : 'SDR'
        )
      ),
      '$4',
    )
  )
)
