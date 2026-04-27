export default function Image({
  src,
  alt,
  fill: _fill,
  ...props
}: {
  src: string;
  alt: string;
  fill?: boolean;
  [key: string]: unknown;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
}
