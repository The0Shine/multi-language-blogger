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
      en: "en",
      vi: "vi",
      zh: "zh",
      fr: "fr",
      de: "de",
      es: "es",
      "zh-CN": "zh",
    };
    console.log(
      `🔄 Language mapping: ${localeCode} -> ${mapping[localeCode] || "en"}`
    );
    return mapping[localeCode] || "en";
  }

  async translateText(text, targetLocaleCode, sourceLocaleCode = "en_US") {
    if (!text) return text;

    const sourceLang = this.getLibreLanguageCode(sourceLocaleCode);
    const targetLang = this.getLibreLanguageCode(targetLocaleCode);

    console.log(`\n📝 TRANSLATE REQUEST:`);
    console.log(`   Original text: "${text}"`);
    console.log(`   Source: ${sourceLocaleCode} (${sourceLang})`);
    console.log(`   Target: ${targetLocaleCode} (${targetLang})`);

    if (sourceLang === targetLang) {
      console.log(`⚠️  Same language detected, skipping translation`);
      return text;
    }

    // Try primary URL first
    try {
      console.log(`🔄 Trying primary URL: ${this.libreTranslateUrl}`);

      const requestData = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      };

      console.log(`📤 Request payload:`, JSON.stringify(requestData, null, 2));

      const response = await axios.post(this.libreTranslateUrl, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      console.log(`📥 Primary response status: ${response.status}`);
      console.log(
        `📥 Primary response data:`,
        JSON.stringify(response.data, null, 2)
      );

      if (response.data && response.data.translatedText) {
        console.log(
          `✅ Primary translation SUCCESS: "${response.data.translatedText}"`
        );
        return response.data.translatedText;
      } else {
        console.log(`❌ Primary response missing translatedText field`);
      }
    } catch (err) {
      console.error(`❌ Primary translation failed:`, {
        message: err.message,
        code: err.code,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : "No response",
      });
    }

    // Try fallback URL
    try {
      console.log(`🔄 Trying fallback URL: ${this.fallbackUrl}`);

      const requestData = {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      };

      console.log(
        `📤 Fallback request payload:`,
        JSON.stringify(requestData, null, 2)
      );

      const fallbackResponse = await axios.post(this.fallbackUrl, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      });

      console.log(`📥 Fallback response status: ${fallbackResponse.status}`);
      console.log(
        `📥 Fallback response data:`,
        JSON.stringify(fallbackResponse.data, null, 2)
      );

      if (fallbackResponse.data && fallbackResponse.data.translatedText) {
        console.log(
          `✅ Fallback translation SUCCESS: "${fallbackResponse.data.translatedText}"`
        );
        return fallbackResponse.data.translatedText;
      } else {
        console.log(`❌ Fallback response missing translatedText field`);
      }
    } catch (err) {
      console.error(`❌ Fallback translation failed:`, {
        message: err.message,
        code: err.code,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : "No response",
      });
    }

    console.log(`🔙 Returning original text as fallback: "${text}"`);
    return text; // fallback
  }

  async translatePostContent(
    content,
    targetLocaleCode,
    sourceLocaleCode = "en_US"
  ) {
    console.log(`\n🚀 STARTING POST CONTENT TRANSLATION`);
    console.log(`📄 Content length: ${content.length} characters`);
    console.log(`🎯 Target locale: ${targetLocaleCode}`);
    console.log(`📍 Source locale: ${sourceLocaleCode}`);

    try {
      const contentObj = JSON.parse(content);
      console.log(`✅ JSON parsed successfully`);
      console.log(`📊 Content structure:`, {
        hasBlocks: !!contentObj.blocks,
        blocksCount: contentObj.blocks ? contentObj.blocks.length : 0,
        blocksIsArray: Array.isArray(contentObj.blocks),
      });

      if (contentObj.blocks && Array.isArray(contentObj.blocks)) {
        console.log(`\n🔄 Processing ${contentObj.blocks.length} blocks...`);

        for (let i = 0; i < contentObj.blocks.length; i++) {
          const block = contentObj.blocks[i];
          console.log(`\n📦 BLOCK ${i + 1}/${contentObj.blocks.length}:`);
          console.log(`   Type: ${block.type || "unknown"}`);
          console.log(`   Has data: ${!!block.data}`);
          console.log(`   Has text: ${!!(block.data && block.data.text)}`);

          if (block.data && block.data.text) {
            console.log(`   Original HTML: "${block.data.text}"`);

            // Parse HTML using JSDOM
            const dom = new JSDOM(`<div>${block.data.text}</div>`);
            const div = dom.window.document.querySelector("div");

            let textNodeCount = 0;

            // Duyệt tất cả child nodes để dịch text node, giữ thẻ
            const translateNode = async (node, depth = 0) => {
              const indent = "  ".repeat(depth);

              if (node.nodeType === 3) {
                // TEXT_NODE
                textNodeCount++;
                console.log(`${indent}📝 Text node ${textNodeCount}:`);
                console.log(`${indent}   Content: "${node.textContent}"`);
                console.log(
                  `${indent}   Trimmed: "${node.textContent.trim()}"`
                );
                console.log(
                  `${indent}   Has content: ${!!node.textContent.trim()}`
                );

                if (node.textContent.trim()) {
                  const original = node.textContent;
                  console.log(`${indent}🔄 Translating: "${original}"`);

                  const translated = await this.translateText(
                    original,
                    targetLocaleCode,
                    sourceLocaleCode
                  );

                  console.log(`${indent}✅ Result: "${translated}"`);
                  console.log(
                    `${indent}🔍 Changed: ${original !== translated}`
                  );

                  node.textContent = translated;
                } else {
                  console.log(`${indent}⏭️  Skipping empty text node`);
                }
              } else if (node.childNodes && node.childNodes.length > 0) {
                console.log(
                  `${indent}🏷️  Element node: ${node.nodeName} (${node.childNodes.length} children)`
                );
                for (const child of node.childNodes) {
                  await translateNode(child, depth + 1);
                }
              } else {
                console.log(
                  `${indent}📄 Other node type: ${node.nodeType} (${node.nodeName})`
                );
              }
            };

            await translateNode(div);

            const newHTML = div.innerHTML;
            console.log(`   Final HTML: "${newHTML}"`);
            console.log(`   HTML changed: ${block.data.text !== newHTML}`);
            console.log(`   Text nodes processed: ${textNodeCount}`);

            block.data.text = newHTML;
          } else {
            console.log(`   ⏭️  Skipping block (no text data)`);
          }
        }
      } else {
        console.log(`⚠️  No blocks array found in content`);
      }

      const result = JSON.stringify(contentObj);
      console.log(`\n🎉 TRANSLATION COMPLETE`);
      console.log(`📏 Result length: ${result.length} characters`);
      console.log(`🔍 Content changed: ${content !== result}`);

      return result;
    } catch (error) {
      console.error(`💥 CONTENT TRANSLATION ERROR:`, {
        message: error.message,
        stack: error.stack,
        contentPreview:
          content.substring(0, 200) + (content.length > 200 ? "..." : ""),
      });
      return content;
    }
  }
}

module.exports = new TranslationService();
