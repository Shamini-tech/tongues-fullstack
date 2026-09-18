// Export an array of language objects holding names, native scripts, speech tags, and ISO codes
export const LANGUAGES = [
  { name: "Afrikaans", native: "Afrikaans", speech: "af-ZA", tr: "af" },
  { name: "Arabic", native: "العربية", speech: "ar-SA", tr: "ar" },
  { name: "Chinese (Simplified)", native: "简体中文", speech: "zh-CN", tr: "zh-CN" },
  { name: "English", native: "English", speech: "en-US", tr: "en" },
  { name: "French", native: "Français", speech: "fr-FR", tr: "fr" },
  { name: "Hindi", native: "हिन्दी", speech: "hi-IN", tr: "hi" },
  { name: "Japanese", native: "日本語", speech: "ja-JP", tr: "ja" },
  { name: "Portuguese", native: "Português", speech: "pt-PT", tr: "pt" },
  { name: "Russian", native: "Русский", speech: "ru-RU", tr: "ru" },
  { name: "Spanish", native: "Español", speech: "es-ES", tr: "es" }
// Sort array alphabetically by language name using localeCompare for reliable sorting
].sort((a, b) => a.name.localeCompare(b.name));

// Export popular languages array used to populate the bottom quick-selection chips
export const QUICK = ["English", "Spanish", "Hindi", "Chinese (Simplified)", "French", "Arabic", "Portuguese", "Russian", "Japanese"];