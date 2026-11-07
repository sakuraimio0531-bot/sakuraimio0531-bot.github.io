/**
 * Nexus Hub - Google Apps Script 後端服務
 * 整合：吉娃娃智能客服 (Chatbot) + 聯絡表單寄信 (Contact Form)
 */

// 1. GET 測試端點 (用於檢查後端是否正常運作)
function doGet(e) {
  var output = {
    status: "success",
    message: "🐶 吉娃娃後端服務正常運行中！",
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. POST 接收請求端點 (處理客服問答與聯絡表單)
function doPost(e) {
  try {
    var params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter;
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
      result = { success: false, reply: "未知的請求動作汪！" };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errOutput = {
      success: false,
      reply: "汪嗚！後端處理時發生微小錯誤：" + error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------------------------------------------
// 吉娃娃智能客服邏輯 (可以在這裡自由擴充更多問答或接 AI)
// ----------------------------------------------------
function handleChatbot(message) {
  var q = message.toLowerCase().trim();
  var reply = "";

  if (!q) {
    return { success: true, reply: "汪？你有說話嗎？吉娃娃的耳朵動了一下！🐶" };
  }

  if (/你是誰|叫什麼|名字|自我介紹/.test(q)) {
    reply = "汪汪！我是運行在 Google Apps Script 雲端上的吉寶！🐶 感謝 Google 伺服器的算力加持，我現在思考速度更快了！";
  } else if (/網站|功能|內容|在幹嘛/.test(q)) {
    reply = "這是 sakuraimio0531 的個人空間，現在後端直接連線到 Google 雲端！支援專注番茄鐘、互動畫布與雲端表單通訊！汪！";
  } else if (/番茄鐘|專注|計時/.test(q)) {
    reply = "專注番茄鐘可以幫您保持 25 分鐘的心流狀態！結束時我會提醒您休息，喝口水再繼續出發！汪！";
  } else if (/聯絡|作者|信箱|email|github/.test(q)) {
    reply = "您可以直接在網頁最下方的聯絡表單送出留言，我會透過 Google 雲端第一時間轉寄給作者唷！信箱：sakuraimio0531@gmail.com 汪！";
  } else if (/發抖|冷|害怕|為什麼發抖/.test(q)) {
    reply = "（持續微幅劇烈發抖）汪！我現在連接到 Google Cloud 雲端機房，機房冷氣有點強，但我這是算力全開的能量釋放！懂不懂雲端吉娃娃的厲害！😤";
  } else if (/骨頭|肉|吃|餓|食物|點心/.test(q)) {
    reply = "🍖 汪嗚！收到來自 Google 雲端傳輸的特級肉骨頭！太香了！吉寶體力值滿血復活！可以再回答 1000 個問題！";
  } else if (/你好|哈囉|嗨|hi|hello|安安/.test(q)) {
    reply = "汪！您好！Google Apps Script 雲端客服【吉寶】向您問好！今天有什麼想聊聊的嗎？";
  } else if (/謝謝|感謝|thx/.test(q)) {
    reply = "不客氣汪！能為您服務是吉寶的榮幸！有問題隨時在雲端呼喚我！🐶✨";
  } else {
    var fallbacks = [
      "汪汪！這個問題太有深度了，吉寶的 Google Apps Script 處理單元正在全速運轉！您可以問我關於「網站功能」、「番茄鐘」或直接送我肉骨頭！🍖",
      "（在 Google 雲端資料庫狂翻筆記）汪？這個吉寶還在吸收學習中！要不要試試問我「你是誰」或「為什麼一直發抖」？",
      "汪嗚！雖然我是吉娃娃，但有 Google 雲端當靠山，我會越來越聰明的！隨時告訴我您的想法！🐶"
    ];
    reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // 嘗試將提問紀錄寫入 Google 試算表（如果有綁定試算表）
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    if (sheet) {
      var logSheet = sheet.getSheetByName("對話紀錄");
      if (!logSheet) {
        logSheet = sheet.insertSheet("對話紀錄");
        logSheet.appendRow(["時間", "使用者提問", "吉娃娃回覆"]);
      }
      logSheet.appendRow([new Date(), message, reply]);
    }
  } catch (e) {
    // 未綁定試算表時自動略過
  }

  return { success: true, reply: reply };
}

// ----------------------------------------------------
// 聯絡表單處理邏輯 (自動寄 Email 通知作者 + 寫入試算表)
// ----------------------------------------------------
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

  // 發送 Email 通知給作者
  try {
    MailApp.sendEmail(targetEmail, subject, body);
  } catch (err) {
    Logger.log("寄信失敗: " + err);
  }

  // 記錄至試算表
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
