# Telegram Open Frames

This is a Telegram bot that lets you send and interact with Open Frames frames in a chat.

## Usage

1. Search for a frame inline by starting the message with `@OpenFramesBot <paste frame url>`.
2. Select the frame you want to send.
3. The frame will be sent to the chat.

## Limitations

- Text input not supported
- `mint` and `tx` actions are not supported
- Data URL images are not supported
- Frames have to be stored and retrieved from a kv store because button data is too large to be stored in a telegram button callback (limit is 64 bytes)

## Development

1. Install dependencies

```
yarn install
```

2. Copy `.env.sample` to `.env` and fill in the values

3. Start the KV store server

```
docker-compose up
```

4. Start the bot

```
yarn dev
```

5. Set the telegram webhook

```
curl -F "url=<APP_URL>/telegram" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
```

6. Search for a frame inline by starting the message with `@<yourbot> <paste frame url>`.

## Telegram Open Frames

The proxy will send `clientProtocol: "*@*"` to the server with the intention that the server will serve a frame that does not require authentication. It only sends `buttonIndex` and `state` in `untrustedData`.

This may change in the future when telegram webhook requests are used as authentication somehow.
