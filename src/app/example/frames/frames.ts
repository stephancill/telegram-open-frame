import { openframes } from "frames.js/middleware";
import { imagesWorkerMiddleware } from "frames.js/middleware/images-worker";
import { createFrames } from "frames.js/next";

type State = {
  counter: number;
  decCount: number;
  incCount: number;
};

export const frames = createFrames<State>({
  baseUrl: process.env.APP_URL,
  initialState: { counter: 0, decCount: 0, incCount: 0 },
  middleware: [
    imagesWorkerMiddleware({ imagesRoute: "/images" }),
    openframes({
      clientProtocol: {
        id: "*",
        version: "*",
      },
      handler: {
        isValidPayload(body) {
          const rawBody = body as any;
          return rawBody.untrustedData && rawBody.untrustedData.buttonIndex;
        },
        async getFrameMessage(body) {
          const rawBody = body as any;
          return {
            buttonIndex: rawBody.untrustedData.buttonIndex,
            state: rawBody.untrustedData.state,
          };
        },
      },
    }),
  ],
});
