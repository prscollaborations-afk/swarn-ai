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
 * Upload a Buffer to Cloudinary
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
 * Run Agnes Vision AI to analyze jewellery and extract microscopic fidelity design lock
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

  const prompt = `You are a world-class high-jewelry master gemologist and 3D jewellery CAD engineer for Haute Atelier Swarn/Aabhushan AI.
Analyze this jewellery product photo with microscopic precision.
Extract every engineering detail:
1. Exact specific link / motif construction: For chains, strictly differentiate Cuban curb links, heavy double-curb braided mesh, Figaro, Mariner, Franco, rope, or tennis links.
2. Link geometry & surface finish: Flat diamond-cut facets vs rounded sub-links, interlocking density, gauge/thickness (e.g. 6mm-10mm heavy gauge), bead-milled texture or mirror-polish 22K yellow gold.
3. Gemstone details: Stone cuts, prong/bezel settings, exact gemstone color, count, and drop motifs.

Return ONLY a valid raw JSON object with the following structure:
{
  "jewellery_type": "necklace" | "earrings" | "ring" | "bangles",
  "metal_colour": "e.g. 22K Solid Yellow Gold (or Rose Gold / Platinum)",
  "stones": "e.g. Plain Gold (No stones) or Emerald & Uncut Polki Diamonds",
  "pattern": "Exact specific pattern e.g. Heavy Double-Curb Mesh Braided Gold Chain or Filigree Bell Jhumkas",
  "wear_location": "earlobes" | "neck and collarbone" | "fingers" | "wrists",
  "quality_score": 98,
  "design_lock": "A dense, high-fidelity 2-sentence description explicitly commanding the exact link weave, thickness/gauge, silhouette, and metal luster so the AI generator renders an identical piece without deviating."
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

  let angleDesc = "front symmetrical high-fashion catalogue portrait shot, chest-up view";
  if (angle === "closeup") angleDesc = "extreme macro close-up detail shot focused razor-sharp on the jewellery craftsmanship";
  else if (angle === "left") angleDesc = "left 45-degree angle regal side-profile portrait";
  else if (angle === "right") angleDesc = "right 45-degree angle three-quarter high-fashion portrait";

  let wearTarget = "wearing EXACTLY ONE SINGLE standalone piece draping gracefully over the collarbone and upper chest with soft, realistic contact shadows. Zero multiple layers, zero extra necklaces, only ONE SINGLE chain";
  if (jewelleryType === "earrings") wearTarget = "wearing exactly ONE matching pair adorned and hanging naturally on both earlobes";
  else if (jewelleryType === "ring") wearTarget = "wearing exactly ONE single statement ring gracefully on the finger of an elegant manicured hand";
  else if (jewelleryType === "bangles") wearTarget = "wearing the handcrafted bangles fitted gracefully on the wrist";

  const garment = gender === "male" 
    ? "bare neck and shoulders or simple classic kurta" 
    : "royal silk saree with elegant open neckline";

  // Craft high-precision prompt enforcing exact physical replication of design_lock
  const prompt = `Award-winning ultra-photorealistic editorial beauty photograph for a luxury Vogue jewellery campaign. An elegant royal Indian ${gender} model (${modelTone} skin tone, ${faceShape} face shape, ${garment}) ${wearTarget}. The ${jewelleryType} must strictly and faithfully replicate: ${designLock}. It must be strictly ONE SINGLE continuous strand with identical link weave, scale, thickness, and gemstone finish with zero stylistic hallucination and zero extra layered strands. Symmetrical studio portrait lighting, high-end jewellery atelier background, 8k resolution, razor-sharp focus on the precious metal and craftsmanship. ${angleDesc}.`;

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

  try {
    const cdnUrl = await uploadRemoteUrlToCloudinary(generatedUrl, "aabhushan_tryon");
    return cdnUrl;
  } catch (err) {
    console.warn("Could not transfer Agnes output to Cloudinary, returning direct URL:", err);
    return generatedUrl;
  }
}
