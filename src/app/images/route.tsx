import { createImagesWorkerRequestHandler } from "frames.js/middleware/images-worker/handler";
import { NextRequest } from "next/server";

const imagesWorker = createImagesWorkerRequestHandler();

export const GET = async (req: NextRequest) => {
  // Unescape URL (telegram bot)
  const unescapedUrl = req.url.replace(/&amp;/g, "&");
  const newReq = new Request(unescapedUrl);

  return await imagesWorker(newReq);
};
