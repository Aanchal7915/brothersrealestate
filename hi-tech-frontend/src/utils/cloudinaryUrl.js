/**
 * Cloudinary serves whatever fixed size it was uploaded at (1200x800) to
 * every card regardless of how small it renders, which is most of why
 * listing pages feel slow to load. Inserting a transformation segment
 * right after `/upload/` asks Cloudinary's CDN for an already-resized,
 * auto-compressed, auto-format variant instead.
 *
 * No-op for anything that isn't a Cloudinary delivery URL (fallback
 * images, absolute non-Cloudinary URLs) so it's safe to wrap every image.
 */
export function optimizedImageUrl(url, width = 600) {
  if (!url || typeof url !== "string") return url;

  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1 || !url.includes("res.cloudinary.com")) return url;

  const insertAt = index + marker.length;
  return `${url.slice(0, insertAt)}w_${width},q_auto,f_auto/${url.slice(insertAt)}`;
}
