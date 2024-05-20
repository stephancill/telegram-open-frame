import { createImagesWorkerRequestHandler } from "frames.js/middleware/images-worker/handler";
import { NextRequest } from "next/server";

const imagesWorker = createImagesWorkerRequestHandler();

export const GET = async (req: NextRequest) => {
  // Unmangle URL (telegram bot)
  const unescapedUrl = req.url.replace(/&amp;/g, "&").replace(/&amp%3B/g, "&");
  const newReq = new Request(unescapedUrl);

  return await imagesWorker(newReq);
};
