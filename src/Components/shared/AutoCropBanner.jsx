import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';

// AutoCropBanner — removes baked-in letterbox bars (solid BLACK or WHITE
// rows at the top/bottom of AI-generated creatives) *dynamically* for any
// image.
//
// Pure CSS cannot do this: object-fit/cover/clip-path can only crop a fixed
// amount, which breaks as soon as a different image has different bars (or
// none). Instead we load the image into a small offscreen canvas, scan rows
// from the top/bottom for near-uniform black or white rows, and shift the
// image up inside an overflow-hidden frame so only the live content shows —
// full width kept.
//
// Safety: crop is clamped (max 35% per side, 60% total) and rows must be
// ~uniformly black or white, so real content (gradients, text, photos)
// never qualifies — only solid padding bars. Same-origin sources (public/
// assets, /uploads blobs) keep the canvas untainted; on any failure we
// render the image as-is.
const DARK_LUMA = 24;
const LIGHT_MIN_CHANNEL = 225;
const ROW_BAR_RATIO = 0.95;
const MAX_SIDE_CROP = 0.35;

const EMPTY_CROP = { top: 0, bottom: 0, left: 0, right: 0, w: 0, h: 0 };

function detectBars(src) {
  const empty = EMPTY_CROP;
  return new Promise((resolve) => {
    const img = new Image();
    // Uploaded banners live on the backend origin (cross-origin vs the
    // frontend). Without this, drawing to canvas taints it and
    // getImageData throws — silently disabling the crop. With it, the
    // backend's CORS headers allow pixel reads. Display never depends on
    // this: on any failure we resolve zero crop and render as-is.
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const natW = img.naturalWidth;
        const natH = img.naturalHeight;
        if (!natW || !natH) return resolve({ ...empty });
        const scanW = 160;
        const scanH = Math.max(1, Math.round((scanW * natH) / natW));
        const canvas = document.createElement('canvas');
        canvas.width = scanW;
        canvas.height = scanH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve({ ...empty, w: natW, h: natH });
        ctx.drawImage(img, 0, 0, scanW, scanH);
        const { data } = ctx.getImageData(0, 0, scanW, scanH);
        const px = (x, y) => {
          const i = (y * scanW + x) * 4;
          return [data[i], data[i + 1], data[i + 2]];
        };
        const isBarPixel = ([r, g, b]) =>
          (r + g + b) / 3 < DARK_LUMA || (r > LIGHT_MIN_CHANNEL && g > LIGHT_MIN_CHANNEL && b > LIGHT_MIN_CHANNEL);
        const isBarRow = (y) => {
          let n = 0;
          for (let x = 0; x < scanW; x += 1) if (isBarPixel(px(x, y))) n += 1;
          return n / scanW >= ROW_BAR_RATIO;
        };
        const isBarCol = (x) => {
          let n = 0;
          for (let y = 0; y < scanH; y += 1) if (isBarPixel(px(x, y))) n += 1;
          return n / scanH >= ROW_BAR_RATIO;
        };
        let top = 0;
        while (top < scanH && isBarRow(top)) top += 1;
        let bottom = 0;
        while (bottom < scanH - top && isBarRow(scanH - 1 - bottom)) bottom += 1;
        let left = 0;
        while (left < scanW && isBarCol(left)) left += 1;
        let right = 0;
        while (right < scanW - left && isBarCol(scanW - 1 - right)) right += 1;
        let topF = Math.min(top / scanH, MAX_SIDE_CROP);
        let bottomF = Math.min(bottom / scanH, MAX_SIDE_CROP);
        let leftF = Math.min(left / scanW, MAX_SIDE_CROP);
        let rightF = Math.min(right / scanW, MAX_SIDE_CROP);
        // Sanity: an image that is almost entirely "bars" is just a dark or
        // light creative — don't crop anything.
        if (topF + bottomF > 0.6) {
          topF = 0;
          bottomF = 0;
        }
        if (leftF + rightF > 0.6) {
          leftF = 0;
          rightF = 0;
        }
        resolve({ top: topF, bottom: bottomF, left: leftF, right: rightF, w: natW, h: natH });
      } catch {
        resolve({ ...empty });
      }
    };
    img.onerror = () => resolve({ ...empty });
    img.src = src;
  });
}

const AutoCropBanner = ({ src, alt, sx, imgSx, minTop = 0, minBottom = 0, minLeft = 0, minRight = 0 }) => {
  const [crop, setCrop] = useState({ ...EMPTY_CROP });

  useEffect(() => {
    let live = true;
    setCrop({ ...EMPTY_CROP });
    if (!src) return undefined;
    detectBars(src).then((c) => {
      if (live) setCrop(c);
    });
    return () => {
      live = false;
    };
  }, [src]);

  // Effective crop = max(auto-detected, admin manual override). The override
  // guarantees a fix for images whose padding the scan can't classify.
  const { top, bottom, left, right, w, h } = crop;
  const effTop = Math.max(top, Number(minTop) || 0);
  const effBottom = Math.max(bottom, Number(minBottom) || 0);
  const effLeft = Math.max(left, Number(minLeft) || 0);
  const effRight = Math.max(right, Number(minRight) || 0);
  const cropped = effTop > 0 || effBottom > 0 || effLeft > 0 || effRight > 0;
  // Cover-style frame that always stays full width: side crops zoom the
  // image up (scale s) so the visible band still fills the width; the frame
  // height matches the visible band. All margin % values are relative to
  // the frame width (= container width).
  const imgRatio = w && h ? h / w : 0;
  const horizKept = Math.max(0.01, 1 - effLeft - effRight);
  const vertKept = Math.max(0.01, 1 - effTop - effBottom);
  const scale = cropped ? 1 / horizKept : 1;
  const frameRatio = cropped && imgRatio
    ? `1000 / ${Math.max(1, Math.round((1000 * imgRatio * vertKept) / horizKept))}`
    : undefined;
  const imgShift = cropped
    ? {
        width: `${scale * 100}%`,
        maxWidth: 'none',
        marginTop: `${-(effTop * imgRatio * scale * 100)}%`,
        marginLeft: `${-(effLeft * scale * 100)}%`,
      }
    : {};

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', ...(frameRatio ? { aspectRatio: frameRatio } : {}), ...sx }}>
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: '100%',
          height: 'auto',
          display: 'block',
          ...imgShift,
          ...imgSx,
        }}
      />
    </Box>
  );
};

export default AutoCropBanner;
