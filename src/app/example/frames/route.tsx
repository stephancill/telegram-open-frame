/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import React from "react";
import { frames } from "./frames";

const frameHandler = frames(async (ctx) => {
  let newState = { ...ctx.state };

  if (ctx.searchParams.op === "+") {
    newState = {
      ...newState,
      counter: newState.counter + 1,
      incCount: newState.incCount + 1,
    };
  } else if (ctx.searchParams.op === "-") {
    newState = {
      ...newState,
      counter: newState.counter - 1,
      decCount: newState.decCount + 1,
    };
  }

  return {
    image: (
      <div tw="flex flex-col">
        <div tw="flex">Sample Telegram Frame</div>
        {ctx.message?.inputText && (
          <div tw="flex">{`Input: ${ctx.message.inputText}`}</div>
        )}
        <div tw="flex">Counter {newState.counter}</div>
      </div>
    ),
    buttons: [
      <Button
        action="post"
        target={{ pathname: "/example/frames", query: { op: "+" } }}
      >
        {`Increment (${newState.incCount})`}
      </Button>,
      <Button
        action="post"
        target={{ pathname: "/example/frames", query: { op: "-" } }}
      >
        {`Decrement (${newState.decCount})`}
      </Button>,
    ],
    state: newState,
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
