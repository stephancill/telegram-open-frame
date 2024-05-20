import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Example Telegram Frame",
    description:
      "This is an example of an Open Frames frame that works in Telegram.",
    other: {
      ...(await fetchMetadata(`${process.env.APP_URL}/example/frames`)),
    },
  };
}

export default function Page() {
  return <div>Example</div>;
}
