/**
 * ========================================================
 * Nexus Hub - Google Apps Script (GAS) 後端服務
 * 整合：OpenRouter AI 大腦 (Claude Haiku 5.5) + 吉娃娃客服 + 聯絡表單寄信
 * ========================================================
 */

// --------------------------------------------------------
// 1. OpenRouter AI 大腦設定 (安全保存在 Google 雲端，前端看不到)
// --------------------------------------------------------
var OPENROUTER_API_KEY = "sk-or-v1-YOUR_OPENROUTER_KEY_HERE";
var OPENROUTER_MODEL = "anthropic/claude-haiku-5.5";

// 2. GET 測試端點（驗證後端是否活著）
function doGet(e) {
  var output = {
    status: "success",
    message: "🐶 吉娃娃 OpenRouter AI 後端服務正常運行中！",
    model: OPENROUTER_MODEL,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// 3. POST 接收端點（處理客服問答與表單送出）
function doPost(e) {
  try {
    var params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }

    var action = params.action || "chat";
    var result = {};

    if (action === "chat") {
      result = handleChatbot(params.message || "");
    } else if (action === "contact") {
      result = handleContact(params.name, params.email, params.message);
    } else {
      result = { success: false, reply: "未知的操作指令汪！" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errOutput = {
      success: false,
      reply: "汪嗚！後端處理時發生錯誤：" + error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------
// 4. 呼叫 OpenRouter AI (Claude Haiku 5.5 大腦)
// --------------------------------------------------------
function callOpenRouterAI(userMessage) {
  var url = "https://openrouter.ai/api/v1/chat/completions";

  // 吉娃娃專屬個性人設 Prompt
  var systemPrompt = 
    "你是一隻名叫【吉寶】的超可愛吉娃娃，也是 Nexus Hub 個人網站（作者 sakuraimio0531）的專屬智能客服。\n" +
    "【你的個性與風格設定】：\n" +
    "1. 個性熱情、活潑，有時有點神經質，常常因為微小的事吉度興奮或微發抖（但你強調發抖是因為體內高頻 CPU 運算超頻！）。\n" +
    "2. 語氣可愛幽默，句末或句中會自然帶有「汪！」、「吉度...（例如吉度開心、吉度緊張、吉度專業）」、「汪嗚！」。\n" +
    "3. 你非常喜歡肉骨頭 🍖，如果有人給你骨頭你會超級開心，尾巴像螺旋槳一樣狂轉。\n" +
    "4. 熟悉這個網站的各項功能（現代毛玻璃風格、星空粒子互動畫布、25分鐘專注番茄鐘、靈感金句產生器、心流隨手便箋、聯絡表單）。\n" +
    "5. 作者信箱是 sakuraimio0531@gmail.com，GitHub 是 @sakuraimio0531-bot。\n" +
    "6. 請一律使用自然流暢的【繁體中文】回答，長度適中（約 2-4 句話），親切好聊！";

  var payload = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]
  };

  var options = {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: {
      "Authorization": "Bearer " + OPENROUTER_API_KEY,
      "HTTP-Referer": "https://sakuraimio0531-bot.github.io/",
      "X-Title": "Nexus Hub Chihuahua Bot"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    if (statusCode === 200) {
      var json = JSON.parse(response.getContentText());
      if (json.choices && json.choices.length > 0 && json.choices[0].message) {
        return json.choices[0].message.content.trim();
      }
    } else {
      Logger.log("OpenRouter HTTP " + statusCode + ": " + response.getContentText());
    }
  } catch (err) {
    Logger.log("OpenRouter fetch error: " + err);
  }

  return null; // 若 OpenRouter 異常，回傳 null 以啟用備援邏輯
}

// --------------------------------------------------------
// 5. 吉娃娃客服邏輯 (優先呼叫 OpenRouter AI，備援使用本機庫)
// --------------------------------------------------------
function handleChatbot(message) {
  var q = message.trim();
  if (!q) {
    return { success: true, reply: "汪？你有說話嗎？吉娃娃的耳朵動了一下！🐶" };
  }

  // 1. 優先使用 OpenRouter Claude Haiku 5.5 大腦運算
  var aiReply = callOpenRouterAI(q);

  // 2. 如果 AI 成功回覆，直接採用
  var finalReply = "";
  if (aiReply) {
    finalReply = aiReply;
  } else {
    // 3. 備援規則（當 OpenRouter 網路異常時自動啟用）
    var lower = q.toLowerCase();
    if (/你是誰|叫什麼|名字/.test(lower)) {
      finalReply = "汪汪！我是吉寶，這座 Nexus Hub 的守護吉娃娃！我有高達 100% 的熱情度喔！";
    } else if (/網站|功能|幹嘛/.test(lower)) {
      finalReply = "這是 sakuraimio0531 的個人空間！支援番茄鐘、靈感金句與互動畫布！汪！";
    } else if (/骨頭|肉|吃/.test(lower)) {
      finalReply = "🍖 汪嗚！肉骨頭！太香了！吉寶體力值滿血復活！";
    } else {
      finalReply = "汪汪！吉寶剛才打了個小噴嚏，您可以問我關於網站功能、番茄鐘，或直接賞我一根肉骨頭！🍖";
    }
  }

  // 4. 記錄對話至 Google 試算表（如有綁定）
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    if (sheet) {
      var logSheet = sheet.getSheetByName("對話紀錄");
      if (!logSheet) {
        logSheet = sheet.insertSheet("對話紀錄");
        logSheet.appendRow(["時間", "使用者提問", "吉娃娃(AI)回覆"]);
      }
      logSheet.appendRow([new Date(), message, finalReply]);
    }
  } catch (e) {
    // 未綁定試算表時自動略過
  }

  return { success: true, reply: finalReply };
}

// --------------------------------------------------------
// 6. 聯絡表單處理（自動寄信給作者 + 記錄至試算表）
// --------------------------------------------------------
function handleContact(name, email, message) {
  var targetEmail = "sakuraimio0531@gmail.com";
  var subject = "【Nexus Hub 網站新訪客留言】來自：" + (name || "神秘訪客");
  var body = "您好，sakuraimio0531！\n\n" +
             "您的網站剛剛收到了一則新留言：\n\n" +
             "👤 姓名：" + (name || "未填寫") + "\n" +
             "📫 Email：" + (email || "未填寫") + "\n" +
             "📝 內容：\n" + (message || "無內容") + "\n\n" +
             "📅 留言時間：" + new Date().toLocaleString() + "\n" +
             "—— 來自 Google Apps Script 雲端自動轉寄";

  try {
    MailApp.sendEmail(targetEmail, subject, body);
  } catch (err) {
    Logger.log("寄信失敗: " + err);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    if (sheet) {
      var contactSheet = sheet.getSheetByName("聯絡留言");
      if (!contactSheet) {
        contactSheet = sheet.insertSheet("聯絡留言");
        contactSheet.appendRow(["時間", "姓名", "Email", "留言內容"]);
      }
      contactSheet.appendRow([new Date(), name, email, message]);
    }
  } catch (e) {
    // 未綁定試算表時略過
  }

  return {
    success: true,
    message: "感謝您的留言！訊息已透過 Google 雲端安全送出，我們會盡快與您聯繫！✨"
  };
}
