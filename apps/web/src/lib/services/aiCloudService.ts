import crypto from "crypto";

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "azbkujpd",
  apiKey: process.env.CLOUDINARY_API_KEY || "595923171546264",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "2wl3pmc1ZMEbj2pa6NF-mNxa8kE",
};

export const AGNES_CONFIG = {
  apiKey: process.env.AGNES_API_KEY || "sk-qiqKwM97UGhTdGALkmqwNZSQ06JDpAAZF34oThRst2AeuQzu",
  baseUrl: "https://apihub.agnes-ai.com/v1",
  visionModel: "agnes-3.0-flash",
  imageGenModel: "agnes-image-2.5-flash",
};

/**
 * Upload a Buffer or Data URL to Cloudinary
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string = "upload.png",
  folder: string = "aabhushan_uploads"
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const strToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
  const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

  const boundary = "----CloudinaryBoundary" + Math.random().toString(36).substring(2);
  const bodyParts: (string | Buffer)[] = [];

  const addField = (name: string, value: string) => {
    bodyParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`);
  };

  addField("folder", folder);
  addField("timestamp", timestamp.toString());
  addField("api_key", CLOUDINARY_CONFIG.apiKey);
  addField("signature", signature);

  bodyParts.push(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`
  );
  bodyParts.push(fileBuffer);
  bodyParts.push(`\r\n--${boundary}--\r\n`);

  const payload = Buffer.concat(
    bodyParts.map((p) => (typeof p === "string" ? Buffer.from(p, "utf-8") : p))
  );

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": payload.length.toString(),
    },
    body: payload,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary buffer upload failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json.secure_url;
}

/**
 * Save an external remote image URL into Cloudinary CDN
 */
export async function uploadRemoteUrlToCloudinary(
  remoteUrl: string,
  folder: string = "aabhushan_tryon"
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const strToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.apiSecret}`;
  const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: remoteUrl,
      folder,
      timestamp,
      api_key: CLOUDINARY_CONFIG.apiKey,
      signature,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary remote URL upload failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json.secure_url;
}

/**
 * Run Agnes Vision AI to analyze jewellery and extract design lock
 */
export async function analyzeJewelleryWithAgnes(
  fileBuffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<{
  jewellery_type: "necklace" | "earrings" | "ring" | "bangles" | string;
  metal_colour: string;
  stones: string;
  pattern: string;
  wear_location: string;
  quality_score: number;
  design_lock: string;
}> {
  const base64Data = fileBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const prompt = `You are a high-jewelry gemologist and visual analyst for Swarn/Aabhushan AI.
Analyze this image of jewellery. Return ONLY a valid JSON markdown or raw JSON with the following structure:
{
  "jewellery_type": "necklace" | "earrings" | "ring" | "bangles",
  "metal_colour": "e.g. 22K Yellow Gold, Rose Gold, Platinum",
  "stones": "e.g. Kundan, Emerald, Solitaire Diamond, Uncut Polki, or Plain Gold",
  "pattern": "e.g. Traditional Jhumka, Filigree Choker, Solitaire Band, Temple Kada",
  "wear_location": "earlobes" | "neck and decolletage" | "fingers" | "wrists",
  "quality_score": 98,
  "design_lock": "A detailed 1-2 sentence description specifying stone cuts, motif, silhouette, and finish to preserve in try-on"
}`;

  const res = await fetch(`${AGNES_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGNES_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AGNES_CONFIG.visionModel,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Agnes vision analysis failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const rawContent = json.choices?.[0]?.message?.content || "";
  
  // Extract JSON from response
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error(`Invalid JSON returned from Agnes vision: ${rawContent}`);
}

/**
 * Generate virtual try-on with Agnes Image 2.5 and save to Cloudinary
 */
export async function generateVirtualTryOn(options: {
  jewelleryType: string;
  designLock: string;
  angle: string;
  modelTone?: string;
  faceShape?: string;
  gender?: string;
}): Promise<string> {
  const { jewelleryType, designLock, angle, modelTone = "warm wheatish", faceShape = "oval", gender = "female" } = options;

  let angleDesc = "front symmetrical high-fashion catalogue portrait shot";
  if (angle === "closeup") angleDesc = "macro close-up detail shot focused sharply on the jewellery";
  else if (angle === "left") angleDesc = "left 45-degree angle regal side-profile portrait";
  else if (angle === "right") angleDesc = "right 45-degree angle three-quarter high-fashion portrait";

  let wearTarget = "on the neck and collarbone";
  if (jewelleryType === "earrings") wearTarget = "adorned on the earlobes";
  else if (jewelleryType === "ring") wearTarget = "worn gracefully on the finger of an elegant hand";
  else if (jewelleryType === "bangles") wearTarget = "worn around the wrist of an elegant hand";

  const prompt = `Ultra-photorealistic 8k editorial Vogue jewellery campaign photograph of an elegant royal Indian ${gender} model (${modelTone} skin tone, ${faceShape} face shape) wearing ${jewelleryType} ${wearTarget}. The jewellery must strictly feature: ${designLock}. Symmetrical lighting, luxury boutique atelier background, high-jewelry editorial aesthetic, 8k resolution, ${angleDesc}.`;

  const res = await fetch(`${AGNES_CONFIG.baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGNES_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AGNES_CONFIG.imageGenModel,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agnes image generation failed (${res.status}): ${err}`);
  }

  const resJson = await res.json();
  const generatedUrl = resJson.data?.[0]?.url;
  if (!generatedUrl) {
    throw new Error("No image URL returned by Agnes image generator");
  }

  // Upload into Cloudinary so it is permanent and fast CDN delivered
  try {
    const cdnUrl = await uploadRemoteUrlToCloudinary(generatedUrl, "aabhushan_tryon");
    return cdnUrl;
  } catch (err) {
    console.warn("Could not transfer Agnes output to Cloudinary, returning direct URL:", err);
    return generatedUrl;
  }
}
