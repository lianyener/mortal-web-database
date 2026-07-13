import { NextRequest, NextResponse } from 'next/server';

// 定義前端傳入的資料介面
interface ReportPayload {
  category?: string;
  content: string;
  url?: string;
  title?: string;
  nickname?: string;
  email?: string;
  userAgent?: string;
  resolution?: string;
  bot_check?: string; // 蜜罐防禦隱藏欄位
}

export async function POST(request: NextRequest) {
  try {
    // 1. 檢查環境變數是否存在
    const gasUrl = process.env.GAS_REPORT_URL;
    if (!gasUrl) {
      console.error('[Report API] 伺服器錯誤：找不到 GAS_REPORT_URL 環境變數');
      return NextResponse.json(
        { success: false, error: '伺服器設定不完整，無法發送回報。' },
        { status: 500 }
      );
    }

    // 2. 解析前端傳來的 JSON 資料
    const body: ReportPayload = await request.json();

    // 3. 蜜罐防禦 (Honeypot Check)
    if (body.bot_check) {
      console.warn('[Report API] 偵測到機器人攔截 (Honeypot triggered)');
      return NextResponse.json({ success: true, message: 'Report received' }, { status: 200 });
    }

    // 4. 必填欄位驗證
    if (!body.content || body.content.trim() === '') {
      return NextResponse.json(
        { success: false, error: '請填寫問題描述內容。' },
        { status: 400 }
      );
    }

    // 5. 整理並清理要轉發給 GAS 的資料 Payload
    const payloadToGas = {
      category: body.category || '未分類',
      content: body.content.trim(),
      url: body.url || '',
      title: body.title || '',
      nickname: body.nickname?.trim() || '匿名大俠',
      email: body.email?.trim() || '未提供',
      userAgent: body.userAgent || request.headers.get('user-agent') || '未知環境',
      resolution: body.resolution || '未知',
    };

    // 6. 呼叫 Google Apps Script Web App API
    // GAS 收到 POST 會產生 302 轉址，Node/Next.js 預設 redirect: 'follow' 會自動跟隨，完美取得最終寫入結果
    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadToGas),
      redirect: 'follow', 
    });

    // 檢查 HTTP 狀態碼
    if (!gasResponse.ok) {
      throw new Error(`GAS API 回應異常狀態碼: ${gasResponse.status}`);
    }

    // 解析 GAS 回傳的 JSON 結構 ({ status: 'success', ... })
    const gasResult = await gasResponse.json();

    if (gasResult.status !== 'success') {
      throw new Error(gasResult.message || '寫入試算表失敗');
    }

    // 7. 回傳成功訊息給前端
    return NextResponse.json(
      { success: true, message: '謝謝大俠的回報！我們已將問題收錄至除錯庫。' },
      { status: 200 }
    );

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Report API] 轉發 GAS 時發生錯誤:', err);
    return NextResponse.json(
      { success: false, error: '發送失敗，請稍後再試。', details: err.message },
      { status: 500 }
    );
  }
}