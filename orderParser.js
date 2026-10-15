import { MENU_ITEMS } from "../config/menuData.js";

/**
 * OrderParser
 * Natural Language understanding engine for canteen voice transcripts.
 * Parses spoken phrases like:
 * "Order one veg sandwich and a cold coffee"
 * "2 crispy veg burgers, 1 masala chai, and a choco lava muffin"
 */
export class OrderParser {
  constructor(menuCatalog = MENU_ITEMS) {
    this.menu = menuCatalog;
    this.numberWordMap = {
      "a": 1,
      "an": 1,
      "one": 1,
      "two": 2,
      "three": 3,
      "four": 4,
      "five": 5,
      "six": 6,
      "seven": 7,
      "eight": 8,
      "nine": 9,
      "ten": 10,
      "couple of": 2,
      "single": 1,
      "double": 2
    };
  }

  /**
   * Parse speech transcript into structured canteen order items
   * @param {string} transcript 
   * @returns {Object}
   */
  parse(transcript) {
    if (!transcript || typeof transcript !== "string") {
      return {
        rawTranscript: "",
        items: [],
        totalAmount: 0,
        totalCount: 0,
        isValidOrder: false,
        summary: "No speech recognized."
      };
    }

    const cleanText = transcript
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const orderItemsMap = new Map();

    // Sort menu items by keyword length descending (so "veg sandwich" matches before "sandwich")
    const sortedKeywords = [];
    this.menu.forEach(item => {
      const allWords = [item.name.toLowerCase(), ...(item.keywords || [])];
      allWords.forEach(kw => {
        sortedKeywords.push({
          keyword: kw.toLowerCase(),
          item: item
        });
      });
    });

    sortedKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

    // Split spoken text into clauses (by 'and', 'with', 'plus', commas, etc.)
    const clauses = cleanText
      .split(/\band\b|\bwith\b|\bplus\b|\balso\b|,/)
      .map(s => s.trim())
      .filter(Boolean);

    clauses.forEach(clause => {
      // Find matching item in this clause
      for (const entry of sortedKeywords) {
        const regex = new RegExp(`\\b${this.escapeRegex(entry.keyword)}\\b`, "i");
        if (regex.test(clause)) {
          // Extract quantity near this item
          const qty = this.extractQuantity(clause, entry.keyword);
          const itemId = entry.item.id;

          if (orderItemsMap.has(itemId)) {
            const existing = orderItemsMap.get(itemId);
            existing.quantity += qty;
            existing.subtotal = existing.quantity * entry.item.price;
          } else {
            orderItemsMap.set(itemId, {
              item: entry.item,
              quantity: qty,
              unitPrice: entry.item.price,
              subtotal: qty * entry.item.price
            });
          }
          break; // Matched primary item in this clause, continue to next
        }
      }
    });

    // If clauses didn't match (e.g. single continuous phrase without connectors)
    if (orderItemsMap.size === 0) {
      for (const entry of sortedKeywords) {
        const regex = new RegExp(`\\b${this.escapeRegex(entry.keyword)}\\b`, "i");
        if (regex.test(cleanText)) {
          const qty = this.extractQuantity(cleanText, entry.keyword);
          const itemId = entry.item.id;
          if (!orderItemsMap.has(itemId)) {
            orderItemsMap.set(itemId, {
              item: entry.item,
              quantity: qty,
              unitPrice: entry.item.price,
              subtotal: qty * entry.item.price
            });
          }
        }
      }
    }

    const items = Array.from(orderItemsMap.values());
    const totalAmount = items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      rawTranscript: transcript,
      cleanedText: cleanText,
      items: items,
      totalAmount: totalAmount,
      totalCount: totalCount,
      isValidOrder: items.length > 0
    };
  }

  /**
   * Look for digits or number words appearing immediately before the keyword
   */
  extractQuantity(text, keyword) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex === -1) return 1;

    // Substring preceding the keyword
    const prefix = text.substring(0, keywordIndex).trim();
    const words = prefix.split(/\s+/);

    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      const secondLastWord = words.length > 1 ? words[words.length - 2] : null;

      // Check two-word number like "couple of"
      if (secondLastWord && `${secondLastWord} ${lastWord}` in this.numberWordMap) {
        return this.numberWordMap[`${secondLastWord} ${lastWord}`];
      }

      // Check single number word
      if (lastWord in this.numberWordMap) {
        return this.numberWordMap[lastWord];
      }

      // Check digit (e.g. "2", "3")
      const parsedNum = parseInt(lastWord, 10);
      if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 50) {
        return parsedNum;
      }
    }

    // Check if a number is right after keyword (e.g., "veg sandwich 2")
    const postfix = text.substring(keywordIndex + keyword.length).trim();
    const postWords = postfix.split(/\s+/);
    if (postWords.length > 0) {
      const firstPostWord = postWords[0];
      if (firstPostWord in this.numberWordMap) {
        return this.numberWordMap[firstPostWord];
      }
      const parsedNum = parseInt(firstPostWord, 10);
      if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 50) {
        return parsedNum;
      }
    }

    return 1; // Default quantity
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
