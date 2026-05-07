import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Danh sách các não bộ ưu tiên (Chọn ra những con ổn định nhất để check)
const rawModels = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-0',
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-image',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-pro-preview-customtools',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'gemini-robotics-er-1.5-preview',
  'gemini-2.5-computer-use-preview-10-2025',
];

const modelsToCheck = [...new Set(rawModels)];

let modelStatus = {};

// Hàm kiểm tra sức khỏe
export async function checkAllModels() {
  console.log('🔍 [AI Service] Đang quét sức khỏe hệ thống não bộ...');
  modelStatus = {};
  
  for (const name of modelsToCheck) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent('hi');
      await result.response;
      modelStatus[name] = 'online';
      // console.log(`✅ Brain [${name}] sẵn sàng!`);
    } catch (error) {
      modelStatus[name] = 'offline';
      // console.log(`❌ Brain [${name}] không khả dụng.`);
    }
  }
}

// Hàm lấy "não" tốt nhất đang Online cho app.js dùng
export function getBestModel() {
  const onlineModels = modelsToCheck.filter((name) => modelStatus[name] === 'online');
  return onlineModels.length > 0 ? onlineModels[0] : 'gemini-robotics-er-1.5-preview';
}

// Hàm lấy dữ liệu cho giao diện Web
export function getStatusData() {
  return modelsToCheck.map((name) => ({
    name: name,
    status: modelStatus[name] || 'checking',
  }));
}

// Tự động quét lại sau mỗi 10 phút
setInterval(checkAllModels, 10 * 60 * 1000);

// Chạy lần đầu ngay khi bật máy
checkAllModels();
