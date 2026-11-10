export function toBits(value: number | bigint, width: number): string {
  const modulus = 1n << BigInt(width);
  let v = BigInt(value) % modulus;
  if (v < 0n) v += modulus;
  return v.toString(2).padStart(width, '0');
}

export function fromBitsUnsigned(bits: string): bigint {
  return bits.length === 0 ? 0n : BigInt('0b' + bits);
}

export function fromBitsSigned(bits: string): bigint {
  const unsigned = fromBitsUnsigned(bits);
  const width = BigInt(bits.length);
  return unsigned >= 1n << (width - 1n) ? unsigned - (1n << width) : unsigned;
}

export function signedRange(width: number): [bigint, bigint] {
  const half = 1n << BigInt(width - 1);
  return [-half, half - 1n];
}

export function parseSignedInt(text: string): bigint | null {
  const t = text.trim();
  if (!/^[+-]?\d+$/.test(t)) return null;
  return BigInt(t);
}

export function parseBinary(text: string): string | null {
  const t = text.replace(/\s+/g, '');
  return /^[01]+$/.test(t) ? t : null;
}

export function groupBits(bits: string, size = 4): string {
  return bits.replace(new RegExp(`(.{${size}})(?=.)`, 'g'), '$1 ');
}
