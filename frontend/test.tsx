const res = await chatApi.sendMessage({
  message: text,
  model: selectedModel,
  image: selectedImage || undefined, // Chỗ này nên dùng biến "file" hoặc "selectedImage"
});
