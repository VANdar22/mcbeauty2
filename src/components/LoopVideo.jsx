import { useEffect, useState } from "react";

// Auto quality + best format, capped width.
const optimise = (url, width) => url.replace("/upload/", `/upload/q_auto,f_auto,w_${width}/`);

// Still frame from the video. `at` = seconds into the clip (Cloudinary start offset).
const posterOf = (url, width, at) =>
  url.replace("/upload/", `/upload/so_${at},q_auto,f_auto,w_${width}/`).replace(/\.mp4$/, ".jpg");

/*
  Silent looping video used as decoration.
  - posterAt: second of the clip used as the still frame (shown while loading
              and for visitors who prefer reduced motion)
  - position: which part stays visible when the video is cropped,
              e.g. "center", "top", "50% 30%"
*/
export default function LoopVideo({
  src,
  width = 1200,
  posterAt = 1,
  position = "center",
  className = "",
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const poster = posterOf(src, width, posterAt);
  const style = { objectPosition: position };

  if (reduceMotion) {
    return <img src={poster} alt="" style={style} className={className} />;
  }

  return (
    <video
      src={optimise(src, width)}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      style={style}
      className={className}
    />
  );
}