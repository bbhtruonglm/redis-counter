import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    // tăng số tự động (atomic)
    const counter = await redis.incr("lookup_counter");

    // format thành 0001
    const formattedCode = counter.toString().padStart(4, "0");

    return Response.json({
      code: formattedCode,
    });
  } catch (error) {
    return Response.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
