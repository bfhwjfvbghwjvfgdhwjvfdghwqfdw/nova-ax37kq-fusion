const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB']
const BINARY_UNITS = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB']

export function formatSize(bytes: number, binary = false) {
  if (bytes === 0) return '0 bytes'
  
  const base = binary ? 1024 : 1000
  const units = binary ? BINARY_UNITS : UNITS
  
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1)
  const value = bytes / Math.pow(base, exponent)
  const unit = units[exponent]
  
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${unit}`
}