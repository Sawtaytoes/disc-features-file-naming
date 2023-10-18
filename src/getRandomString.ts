export const getRandomString = () => (
  Math
  .floor(
    (
      Math
      .random()
    )
    + 1
  )
  .toString(36)
  .slice(0, 6)
)
