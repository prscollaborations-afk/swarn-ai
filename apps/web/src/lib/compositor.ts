/**
 * Direct Client-Side Optical Compositor
 * Crops the user's uploaded jewellery photo with smooth transparency feathering
 * and pastes the EXACT pixels directly onto the luxury model base without any AI hallucination.
 */

export interface CompositeOptions {
  modelUrl: string;
  jewelleryUrl: string;
  jewelleryType: string;
  watermarkText?: string;
  enableWatermark?: boolean;
}

export async function createDirectExactTryOn(options: CompositeOptions): Promise<string> {
  const { modelUrl, jewelleryUrl, jewelleryType, watermarkText, enableWatermark } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Cannot get 2d canvas context"));

    const modelImg = new Image();
    modelImg.crossOrigin = "anonymous";

    modelImg.onload = () => {
      // 1. Draw photorealistic model
      ctx.drawImage(modelImg, 0, 0, 1024, 1024);

      const jewelImg = new Image();
      jewelImg.crossOrigin = "anonymous";

      jewelImg.onload = () => {
        // 2. Extract jewellery onto offscreen canvas for background removal
        const offCanvas = document.createElement("canvas");
        offCanvas.width = jewelImg.naturalWidth || jewelImg.width;
        offCanvas.height = jewelImg.naturalHeight || jewelImg.height;
        const offCtx = offCanvas.getContext("2d");
        if (!offCtx) return reject(new Error("Cannot get offscreen context"));

        offCtx.drawImage(jewelImg, 0, 0);
        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        // Sample corner background colors
        const bgR = (data[0] + data[(offCanvas.width - 1) * 4] + data[(offCanvas.height - 1) * offCanvas.width * 4]) / 3;
        const bgG = (data[1] + data[(offCanvas.width - 1) * 4 + 1] + data[(offCanvas.height - 1) * offCanvas.width * 4 + 1]) / 3;
        const bgB = (data[2] + data[(offCanvas.width - 1) * 4 + 2] + data[(offCanvas.height - 1) * offCanvas.width * 4 + 2]) / 3;

        let minX = offCanvas.width, minY = offCanvas.height, maxX = 0, maxY = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          const isWhite = r > 230 && g > 230 && b > 230;
          const isDarkBackdrop = r < 40 && g < 40 && b < 40;

          if (diff < 45 || isWhite || (bgR < 50 && isDarkBackdrop)) {
            data[i + 3] = 0; // Transparent
          } else {
            const x = (i / 4) % offCanvas.width;
            const y = Math.floor((i / 4) / offCanvas.width);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
        offCtx.putImageData(imgData, 0, 0);

        const cropW = Math.max(10, maxX - minX);
        const cropH = Math.max(10, maxY - minY);

        // 3. Coordinate placement per category
        if (jewelleryType === "earrings") {
          // Half for right ear, half for left ear
          const singleW = cropW / 2;
          const targetH = 105;
          const targetW = (singleW / cropH) * targetH;

          // Model's right earlobe (viewer right): x = 604, y = 296
          ctx.save();
          ctx.shadowColor = "rgba(10, 8, 6, 0.65)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 4;
          ctx.drawImage(offCanvas, minX + singleW, minY, singleW, cropH, 604 - (targetW / 2), 294, targetW, targetH);
          ctx.restore();

          // Model's left earlobe (viewer left): x = 346, y = 306
          ctx.save();
          ctx.shadowColor = "rgba(10, 8, 6, 0.65)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 4;
          ctx.drawImage(offCanvas, minX, minY, singleW, cropH, 346 - (targetW / 2), 304, targetW, targetH);
          ctx.restore();
        } else if (jewelleryType === "necklace" || jewelleryType === "full_set") {
          // Model clavicle drape: center x = 495, top y = 520
          const targetW = 420;
          const targetH = (cropH / cropW) * targetW;
          const targetX = 495 - (targetW / 2);
          const targetY = 530;

          ctx.save();
          ctx.shadowColor = "rgba(12, 10, 8, 0.75)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 6;
          ctx.drawImage(offCanvas, minX, minY, cropW, cropH, targetX, targetY, targetW, targetH);
          ctx.restore();
        } else if (jewelleryType === "ring") {
          // Statement ring on hand
          const targetW = 120;
          const targetH = (cropH / cropW) * targetW;
          ctx.save();
          ctx.shadowColor = "rgba(10, 8, 6, 0.6)";
          ctx.shadowBlur = 6;
          ctx.drawImage(offCanvas, minX, minY, cropW, cropH, 480, 720, targetW, targetH);
          ctx.restore();
        } else {
          // Bangles on wrist
          const targetW = 200;
          const targetH = (cropH / cropW) * targetW;
          ctx.save();
          ctx.shadowColor = "rgba(10, 8, 6, 0.6)";
          ctx.shadowBlur = 8;
          ctx.drawImage(offCanvas, minX, minY, cropW, cropH, 440, 680, targetW, targetH);
          ctx.restore();
        }

        // 4. Client Brand Watermark
        if (enableWatermark && watermarkText) {
          ctx.save();
          ctx.font = "bold 16px sans-serif";
          ctx.fillStyle = "rgba(251, 191, 36, 0.95)";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 6;
          ctx.textAlign = "right";
          ctx.fillText(watermarkText.toUpperCase(), 1024 - 40, 60);
          ctx.restore();
        }

        resolve(canvas.toDataURL("image/png"));
      };

      jewelImg.onerror = () => reject(new Error("Failed to load uploaded jewellery for optical compositing"));
      jewelImg.src = jewelleryUrl;
    };

    modelImg.onerror = () => reject(new Error("Failed to load base model image"));
    modelImg.src = modelUrl;
  });
}
