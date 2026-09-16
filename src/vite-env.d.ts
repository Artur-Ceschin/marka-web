/// <reference types="vite/client" />

declare module '*&as=picture' {
  const out: {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  };
  export default out;
}

// exifr ships its smaller builds without their own type declarations. The mini
// build exposes the same `gps` function as the full one.
declare module 'exifr/dist/mini.esm.mjs' {
  export { gps } from 'exifr';
}
