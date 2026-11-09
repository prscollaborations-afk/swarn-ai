import crypto from "crypto";

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "azbkujpd",
  apiKey: process.env.CLOUDINARY_API_KEY || "595923171546264",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "2wl3pmc1ZMEbj2pa6NF-mNxa8kE",
};

export const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: process.env.GEMINI_TEXT_MODEL || "gemini-3.5-flash-lite",
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
 * Run Gemini 3.5 / Agnes Multimodal Vision AI to analyze jewellery and extract microscopic CAD design lock
 */
export async function analyzeJewelleryWithAgnes(
  fileBuffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<{
  jewellery_type: "necklace" | "earrings" | "ring" | "bangles" | "full_set" | string;
  metal_colour: string;
  stones: string;
  pattern: string;
  wear_location: string;
  quality_score: number;
  design_lock: string;
}> {
  const base64Data = fileBuffer.toString("base64");

  const prompt = `You are a world-class high-jewelry master gemologist and 3D jewellery CAD engineer for Haute Atelier Swarn/Aabhushan AI.
Analyze this jewellery product photo with microscopic precision.
Check if this is a single item or a complete bridal / jewellery set (necklace + earrings + maang tikka / bangles).
Extract every engineering detail:
1. Exact specific link / motif construction: For chains, strictly differentiate Cuban curb links, heavy double-curb braided mesh, Figaro, Mariner, Franco, rope, or tennis links. For sets/jhumkas, detail flower rosette studs, drops, beads, and lattice openwork.
2. Link geometry & surface finish: Flat diamond-cut facets vs rounded sub-links, interlocking density, gauge/thickness (e.g. 6mm-10mm heavy gauge), bead-milled texture or mirror-polish 22K yellow gold.
3. Gemstone details: Stone cuts, prong/bezel settings, exact gemstone color, count, and drop motifs.

Return ONLY a valid raw JSON object with the following structure:
{
  "jewellery_type": "necklace" | "earrings" | "ring" | "bangles" | "full_set",
  "metal_colour": "e.g. 22K Solid Yellow Gold (or Rose Gold / Platinum)",
  "stones": "e.g. Plain Gold (No stones) or Emerald & Uncut Polki Diamonds",
  "pattern": "Exact specific pattern e.g. Heavy Double-Curb Mesh Braided Gold Chain or Bridal Kundan Haar Set with Matching Jhumkas",
  "wear_location": "earlobes" | "neck and collarbone" | "fingers" | "wrists" | "full neck, ears and forehead",
  "quality_score": 98,
  "design_lock": "A dense, high-fidelity 2-sentence description explicitly commanding the exact link weave, thickness/gauge, silhouette, and metal luster so the AI generator renders an identical piece without deviating."
}`;

  // Try Google Gemini 3.5 Flash-Lite Vision first
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: "application/json",
        },
      }),
    });

    if (geminiRes.ok) {
      const gData = await geminiRes.json();
      const gText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (gText) {
        const jsonMatch = gText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            jewellery_type: parsed.jewellery_type || "necklace",
            metal_colour: parsed.metal_colour || "22K Yellow Gold",
            stones: parsed.stones || "Plain Gold",
            pattern: parsed.pattern || "Traditional Indian Jewellery",
            wear_location: parsed.wear_location || "neck and collar",
            quality_score: Number(parsed.quality_score) || 98,
            design_lock: parsed.design_lock || parsed.pattern || "",
          };
        }
      }
    }
  } catch (err) {
    console.warn("Gemini vision analysis fallback to Agnes:", err);
  }

  // Fallback to Agnes Vision AI
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
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
  let wearTarget = "";
  let garment = "";
  let strictNegativeConstraint = "";

  if (jewelleryType === "earrings") {
    angleDesc = "front symmetrical beauty portrait, ears clearly visible and hair tucked back behind ears, head and neck framing";
    if (angle === "left") angleDesc = "left 45-degree angle profile shot showcasing the left ear and earring in razor-sharp focus";
    if (angle === "right") angleDesc = "right 45-degree angle profile shot showcasing the right ear and earring in razor-sharp focus";
    if (angle === "closeup") angleDesc = "extreme macro close-up detail shot focused sharply on the earlobe and earring craftsmanship";
    
    wearTarget = "wearing ONLY the matching pair of earrings hanging naturally on the earlobes. Clean bare neck with NO necklace, NO chain, NO collar jewellery whatsoever";
    garment = gender === "male" ? "simple classic collarless kurta" : "elegant high-fashion silk saree with bare unadorned neckline";
    strictNegativeConstraint = "ABSOLUTELY NO NECKLACE, NO CHAINS, NO CHOKER, NO PENDANT. The neck and chest are completely bare of jewellery. The only jewellery is the earrings.";
  } else if (jewelleryType === "necklace") {
    wearTarget = "wearing EXACTLY ONE SINGLE standalone necklace draping gracefully over the collarbone and upper chest with soft realistic contact shadows. Zero multiple layers, zero extra necklaces, only ONE SINGLE chain";
    garment = gender === "male" ? "bare neck and shoulders or simple classic kurta" : "royal silk saree with elegant open neckline";
    strictNegativeConstraint = "Zero multiple chains, zero layered necklaces. Exactly one single standalone piece.";
  } else if (jewelleryType === "ring") {
    angleDesc = "artistic hand-to-face portrait or manicured hand pose";
    wearTarget = "wearing exactly ONE single statement ring gracefully on the finger of an elegant manicured hand";
    garment = "minimalist luxury silk attire";
    strictNegativeConstraint = "Zero other rings, zero wristwatches.";
  } else if (jewelleryType === "bangles") {
    angleDesc = "high-fashion portrait with wrist gracefully positioned";
    wearTarget = "wearing the handcrafted bangles fitted gracefully on the wrist";
    garment = "minimalist luxury silk attire";
    strictNegativeConstraint = "Zero additional armbands.";
  } else if (jewelleryType === "full_set" || jewelleryType === "set") {
    angleDesc = "regal symmetrical bridal beauty portrait, full front chest-up view with hair parted for maang tikka, earlobes and neck fully framed";
    wearTarget = "wearing the complete coordinated royal bridal jewellery ensemble: matching necklace draping the collarbone, matching jhumka earrings on both earlobes, and matching bridal maang tikka on forehead";
    garment = "luxurious Banarasi silk bridal saree with deep red and gold zari embroidery";
    strictNegativeConstraint = "Only wear the matching pieces from this unified set.";
  }

  // Craft high-precision prompt enforcing exact physical replication of design_lock
  const prompt = `Award-winning ultra-photorealistic editorial beauty photograph for a luxury Vogue jewellery campaign. An elegant royal Indian ${gender} model (${modelTone} skin tone, ${faceShape} face shape, ${garment}) ${wearTarget}. The ${jewelleryType} must strictly and faithfully replicate: ${designLock}. Symmetrical studio portrait lighting, high-end jewellery atelier background, 8k resolution, razor-sharp focus on the precious metal and craftsmanship. ${strictNegativeConstraint} ${angleDesc}.`;

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
