export function useGoogleFont(family: string): string {
  switch (family) {
    case 'Fraunces':
      return 'Fraunces, Georgia, serif'
    case 'Manrope':
      return '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif'
    case 'Plus Jakarta Sans':
      return '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif'
    default:
      return `"${family}", sans-serif`
  }
}
