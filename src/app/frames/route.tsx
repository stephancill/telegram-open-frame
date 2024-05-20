import { NextRequest } from "next/server";
import { GET as framesGET, POST } from "@frames.js/render/next";

export const GET = async (req: NextRequest) => {
  const res = await framesGET(req);
  res.headers.set("Access-Control-Allow-Origin", "*");
  return res;
};

export { POST };
