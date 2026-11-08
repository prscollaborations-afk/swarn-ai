import { NextRequest, NextResponse } from "next/server";
import { getJob } from "../jobsRegistry";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = getJob(params.id);

    // If job is still processing, return status "processing"
    if (job && job.status === "processing") {
      return NextResponse.json({
        success: true,
        data: {
          job_id: params.id,
          status: "processing",
        },
      });
    }

    // If completed and has images, return them
    if (job?.images && job.images.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          job_id: params.id,
          status: "completed",
          images: job.images,
        },
      });
    }

    let jType = job?.jewellery_type?.toLowerCase() || "necklace";
    if (!["earrings", "necklace", "ring", "bangles"].includes(jType)) {
      if (jType.includes("earring") || jType.includes("jhumka")) jType = "earrings";
      else if (jType.includes("ring")) jType = "ring";
      else if (jType.includes("bangle") || jType.includes("kada")) jType = "bangles";
      else jType = "necklace";
    }

    const anglesToGenerate = (job?.target_angles && job.target_angles.length > 0)
      ? job.target_angles
      : ["front", "closeup", "left", "right"];

    const angleLabels: Record<string, string> = {
      front: "FRONT VIEW",
      closeup: "MACRO DETAIL",
      left: "LEFT 45° REGAL",
      right: "RIGHT 45° THREE-QUARTER",
      three_quarter: "PORTRAIT 45°",
    };

    const angleFileKeys: Record<string, string> = {
      front: "front",
      closeup: "closeup",
      left: "left",
      right: "right",
      three_quarter: "right",
    };

    const images = anglesToGenerate.map((angleName, idx) => {
      const fileKey = angleFileKeys[angleName] || "front";
      const displayLabel = angleLabels[angleName] || angleName.toUpperCase();
      const imageUrl = `/models/${jType}_${fileKey}.jpg`;

      return {
        id: `img-${jType}-${fileKey}-${idx}`,
        url: imageUrl,
        angle: angleName,
        label: `${jType.toUpperCase()} | Shot: ${displayLabel}`,
        resolution: job?.resolution || "HD",
        fidelity_score: 98 - (idx % 3),
        model_info: `Indian Model (${job?.model_info || "Warm Sand 3, Oval Face, Banarasi Silk"})`,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        job_id: params.id,
        status: "completed",
        images: images,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, detail: err.message }, { status: 500 });
  }
}
