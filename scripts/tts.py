import asyncio
import sys

import edge_tts

voice = sys.argv[1]
out = sys.argv[2]
rate = sys.argv[3] if len(sys.argv) > 3 else "-8%"
text = sys.stdin.read().strip()
if not text:
    raise SystemExit("empty tts text")


async def main():
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(out)


asyncio.run(main())
