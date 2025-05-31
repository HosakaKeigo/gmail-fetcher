type FAQRow = [
  question: string,
  todo: string,
  reply: string
]

/**
 * FAQデータをJSONL形式にエクスポートする
 *
 * あらかじめGoogle ColabでFAQデータをシートに用意しておく必要があります。
 * @returns 作成されたファイルのURL
 */
function exportFAQDataToJSONL(): string {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FaqSheetNameProcessed);
  if (!sheet) {
    throw new Error(`${FaqSheetName}シートが見つかりません。`);
  }

  const values = sheet.getDataRange().getValues();
  // ヘッダー行を除外
  const dataRows = values.slice(1) as FAQRow[];

  // JSONLデータを作成
  const jsonlData = formatFAQDataToJSONL(dataRows);

  // StepFAQフォルダを取得もしくは作成
  const FaqFolder = getOrCreateFolder(OutputFolderName);

  // JSONLファイルを作成
  const fileName = `FAQ_${new Date().toISOString().split('T')[0]}.jsonl`;
  const blob = Utilities.newBlob(jsonlData, "application/jsonl", fileName);

  const file = FaqFolder.createFile(blob);
  Logger.log(`Exported JSONL file: ${file.getUrl()}`);

  return file.getUrl();
}

/**
 * FAQデータをJSONL形式に変換する
 * @param values FAQデータの配列
 * @returns JSONL形式のテキスト
 */
function formatFAQDataToJSONL(values: FAQRow[]): string {
  return values.map((row, index) => {
    // 各行をJSONオブジェクトに変換
    const faqItem = {
      faq_id: index + 1,
      question: row[0]?.trim() || "",
      action: row[1]?.trim() || "",
      answer: row[2]?.trim() || ""
    };

    // JSONオブジェクトを文字列に変換し、一行ごとに追加
    return JSON.stringify(faqItem);
  }).join('\n');
}

/**
 * 指定された名前のフォルダを取得または作成する
 * @param folderName フォルダ名
 * @returns フォルダオブジェクト
 */
function getOrCreateFolder(folderName: string): GoogleAppsScript.Drive.Folder {
  // 既存のフォルダを検索
  const folderIterator = DriveApp.getFoldersByName(folderName);

  // フォルダが存在すればそれを返す
  if (folderIterator.hasNext()) {
    return folderIterator.next();
  }

  // フォルダが存在しなければ新規作成
  return DriveApp.createFolder(folderName);
}
