# AR performance improvements

The original video, photos, voice recording, segmentation models, camera framing, edge feathering and 1080×1920 photo/video canvas are retained.

- The camera, segmentation helpers and narration code load in a separate JavaScript chunk only when a camera experience is opened. Other pages and the AR gallery no longer parse this feature on initial load.
- Below-the-fold collection posters use native lazy loading and asynchronous image decoding.
- The camera consent screen warms the segmentation model download and CDN connections without requesting camera/microphone access or starting inference.
- When viewing a saved recording, the hidden backdrop pauses alongside the already-paused segmentation/rendering and live narration. Starting over resumes the original background and voice positions.
- Mobile software matting skips bilinear calculations for fully opaque/transparent regions. Edge pixels retain the original bilinear interpolation. Regression tests compare complete RGBA output, including partial opacity and mirrored/rear-camera cases.

A local Node benchmark of 480×854 compositing against a 256×456 feathered silhouette, using seven batches of fifty frames, measured median matte application at 1.069 ms before and 0.760 ms after (about 29% less time for this step). This is a component benchmark, not an end-to-end phone FPS measurement.

The original beach MP4 already has its `moov` atom before its media data (fast start), so it was not re-encoded. Full-quality media download sizes remain unchanged.
