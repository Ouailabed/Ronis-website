/**
 * A food illustration rendered from the site's 3D models (see /public/renders and ASSETS.md).
 * Always labelled so it's never mistaken for a photo of a Roni's product.
 * Replace with real photography by swapping `src` and removing `illustration`.
 */
type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  illustration?: boolean;
  eager?: boolean;
};

export default function RenderImage({ src, alt, width, height, className = "", illustration = true, eager = false }: Props) {
  return (
    <figure className={`render-image ${className}`}>
      <img src={src} alt={alt} width={width} height={height} loading={eager ? "eager" : "lazy"} decoding="async" />
      {illustration && <figcaption className="render-note">Illustration</figcaption>}
    </figure>
  );
}
