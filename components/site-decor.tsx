import { siteAsset } from "@/lib/assets";

/**
 * Fixed, scroll-independent background decorations:
 *  - hvving calligraphy at the left-center
 *  - animated banner (video) at the bottom-right
 * Both sit behind the page content (z-0) and ignore pointer events.
 */
export function SiteDecor() {
  const calligraphy = siteAsset("hvving.png");
  const video = siteAsset("banner_animate.mp4");

  return (
    <>
      {calligraphy && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={calligraphy}
          alt=""
          aria-hidden
          className="pointer-events-none select-none fixed left-1 md:left-6 top-1/2 -translate-y-1/2 h-[42vh] md:h-[66vh] w-auto object-contain z-0 opacity-50 md:opacity-60"
        />
      )}
      {video && (
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          src={video}
          className="pointer-events-none fixed bottom-3 right-3 md:bottom-5 md:right-5 w-16 md:w-24 z-0 opacity-90"
        />
      )}
    </>
  );
}
