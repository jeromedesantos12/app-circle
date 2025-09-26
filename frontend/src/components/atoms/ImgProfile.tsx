export function ImgProfile({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={src ?? "/img/profile.jpg"}
      className={`${className} object-cover rounded-full`}
      alt={alt}
    />
  );
}
