import { Redis } from "@upstash/redis";

/**
 * Khởi tạo Redis client
 * Sử dụng biến môi trường UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN
 */
const REDIS = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cấu hình headers cho CORS (Cross-Origin Resource Sharing)
 * Cho phép tất cả các origin (*), các method và headers cần thiết
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Xử lý preflight request (OPTIONS) cho CORS
 * Browser sẽ gửi request này trước khi gửi request chính để kiểm tra quyền truy cập
 * @returns {Response} Trả về response rỗng với headers CORS
 */
export async function OPTIONS() {
  return Response.json({}, { headers: CORS_HEADERS });
}

/**
 * API handler cho method GET
 * Tự động tăng counter trong Redis và format thành mã có 4 chữ số
 * @returns {Promise<Response>} Trả về JSON chứa code hoặc lỗi
 */
export async function GET() {
  try {
    // Tăng số tự động (atomic) trong Redis với key "lookup_counter"
    const counter = await REDIS.incr("lookup_counter");

    // Format số thành chuỗi 4 ký tự, có số 0 ở đầu (ví dụ: 1 -> "0001")
    const formatted_code = counter.toString().padStart(4, "0");

    // Trả về kết quả thành công với headers CORS
    return Response.json(
      {
        code: formatted_code,
      },
      {
        headers: CORS_HEADERS,
      },
    );
  } catch (error) {
    // Trả về lỗi 500 nếu có exception, kèm headers CORS (để client vẫn đọc được lỗi)
    return Response.json(
      { error: "Failed to generate code" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
