const S3_ORIGIN =
  process.env.NEXT_PUBLIC_IMAGES_S3_ORIGIN ??
  'https://marka-api-dev-images-058264487329.s3.us-east-1.amazonaws.com';
const CDN = process.env.NEXT_PUBLIC_IMAGES_CDN_URL ?? S3_ORIGIN;

export function cdnUrl(url: string | null | undefined): string | undefined {
  if (!url) {return undefined;}
  if (url.startsWith(S3_ORIGIN)) {return url.replace(S3_ORIGIN, CDN);}
  return url;
}
