// import dotenv from 'dotenv';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Danh sách các model cần kiểm tra
// const modelsToCheck = [
//   'gemini-1.5-flash',
//   'gemini-1.5-pro',
//   'gemini-2.0-flash',
//   'gemini-2.0-flash-lite',
//   'gemini-3-flash-preview',
//   'gemini-2.5-flash',
//   'gemini-2.5-pro',
//   'gemini-2.0-flash',
//   'gemini-2.0-flash-0',
//   'gemini-2.0-flash-lite-001',
//   'gemini-2.0-flash-lite',
//   'gemini-2.5-flash-preview-tts',
//   'gemini-2.5-pro-preview-tts',
//   'gemma-3-1b-it',
//   'gemma-3-4b-it',
//   'gemma-3-12b-it',
//   'gemma-3-27b-it',
//   'gemma-3n-e4b-it',
//   'gemma-3n-e2b-it',
//   'gemini-flash-latest',
//   'gemini-flash-lite-latest',
//   'gemini-pro-latest',
//   'gemini-2.5-flash-lite',
//   'gemini-2.5-flash-image',
//   'gemini-2.5-flash-lite-preview-09-2025',
//   'gemini-3-pro-preview',
//   'gemini-3-flash-preview',
//   'gemini-3.1-pro-preview',
//   'gemini-3.1-pro-preview-customtools',
//   'gemini-3.1-flash-lite-preview',
//   'gemini-3-pro-image-preview',
//   'nano-banana-pro-preview',
//   'gemini-3.1-flash-image-preview',
//   'lyria-3-clip-preview',
//   'lyria-3-pro-preview',
//   'gemini-robotics-er-1.5-preview',
//   'gemini-2.5-computer-use-preview-10-2025',
//   'deep-research-pro-preview-12-2025',
// ];

// async function checkModel(modelName) {
//   try {
//     const model = genAI.getGenerativeModel({ model: modelName });
//     // Gửi tin nhắn siêu ngắn để test quota
//     const result = await model.generateContent('hi');
//     const response = await result.response;
//     return '✅ ĐANG CHẠY TỐT';
//   } catch (error) {
//     if (error.message.includes('429')) {
//       return '❌ HẾT LƯỢT (QUOTA 429)';
//     } else if (error.message.includes('404')) {
//       return '❓ SAI TÊN MODEL (404)';
//     } else {
//       return `⚠️ LỖI KHÁC: ${error.status}`;
//     }
//   }
// }

// async function runCheck() {
//   console.log('🔍 --- ĐANG KIỂM TRA SỨC KHỎE CÁC CON CHAT ---');
//   console.log('Vui lòng chờ giây lát...\n');

//   for (const name of modelsToCheck) {
//     const status = await checkModel(name);
//     console.log(`${name.padEnd(25)} : ${status}`);
//   }

//   console.log('\n--- XONG ---');
//   process.exit(0);
// }

// runCheck();

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Danh sách các não bộ ưu tiên (Chọn ra những con ổn định nhất để check)
const modelsToCheck = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
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
  'gemini-robotics-er-1.5-preview',
];

let modelStatus = {}; // Lưu trạng thái: { 'gemini-1.5-flash': 'online', ... }

// Hàm kiểm tra sức khỏe
export async function checkAllModels() {
  console.log('🔍 [AI Service] Đang quét sức khỏe hệ thống não bộ...');
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
  return onlineModels.length > 0 ? onlineModels[0] : 'gemini-1.5-flash';
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
