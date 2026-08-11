export function useGoogleFont(family: string): string {
  switch (family) {
    case 'Fraunces':
      return 'Fraunces, Georgia, serif'
    case 'Manrope':
      return 'Manrope, Arial, sans-serif'
    default:
      return `"${family}", sans-serif`
  }
}
