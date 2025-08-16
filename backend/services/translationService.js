const axios = require("axios");
const { JSDOM } = require("jsdom");

class TranslationService {
  constructor() {
    this.libreTranslateUrl =
      process.env.LIBRETRANSLATE_URL || "http://localhost:5000/translate";
    this.fallbackUrl = "https://libretranslate.de/translate";
  }

  getLibreLanguageCode(localeCode) {
    const mapping = {
      en_US: "en",
      vi_VN: "vi",
      zh_CN: "zh",
      fr_FR: "fr",
      de_DE: "de",
      es_ES: "es",
    };
    return mapping[localeCode] || "en";
  }

  async translateText(text, targetLocaleCode, sourceLocaleCode = "en_US") {
    if (!text) return text;
    const sourceLang = this.getLibreLanguageCode(sourceLocaleCode);
    const targetLang = this.getLibreLanguageCode(targetLocaleCode);

    if (sourceLang === targetLang) return text;

    try {
      const response = await axios.post(
        this.libreTranslateUrl,
        {
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
        },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );

      if (response.data && response.data.translatedText) {
        return response.data.translatedText;
      }
    } catch (err) {
      console.warn(`Local translation failed: ${err.message}, falling back`);
    }

    try {
      const fallbackResponse = await axios.post(
        this.fallbackUrl,
        {
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
        },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );

      if (fallbackResponse.data && fallbackResponse.data.translatedText) {
        return fallbackResponse.data.translatedText;
      }
    } catch (err) {
      console.error(`Fallback translation failed: ${err.message}`);
    }

    return text; // fallback
  }

  async translatePostContent(
    content,
    targetLocaleCode,
    sourceLocaleCode = "en_US"
  ) {
    try {
      const contentObj = JSON.parse(content);

      if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
        for (let i = 0; i < contentObj.blocks.length; i++) {
          const block = contentObj.blocks[i];

          if (block.data && block.data.text) {
            // Parse HTML using JSDOM
            const dom = new JSDOM(`<div>${block.data.text}</div>`);
            const div = dom.window.document.querySelector("div");

            // Duyệt tất cả child nodes để dịch text node, giữ thẻ
            const translateNode = async (node) => {
              if (node.nodeType === 3) {
                // TEXT_NODE
                if (node.textContent.trim()) {
                  const original = node.textContent;
                  node.textContent = await this.translateText(
                    original,
                    targetLocaleCode,
                    sourceLocaleCode
                  );
                }
              } else if (node.childNodes && node.childNodes.length > 0) {
                for (const child of node.childNodes) {
                  await translateNode(child);
                }
              }
            };

            await translateNode(div);

            block.data.text = div.innerHTML;
          }
        }
      }

      return JSON.stringify(contentObj);
    } catch (error) {
      console.error("Content translation error:", error.message);
      return content;
    }
  }
}

module.exports = new TranslationService();
