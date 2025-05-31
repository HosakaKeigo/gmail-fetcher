/**
 * 指定のメールを取得し、Google Sheetsに保存
 */
function main() {
  const sheet = getFAQSheet();

  // 最終行のcreated_atを取得（存在する場合）
  const lastCreatedAt = getLastCreatedAt(sheet);
  Logger.log(`Last created_at date: ${lastCreatedAt}`);

  /**
   * 引数はconfig.tsで定義されている
   */
  const fetcher = new GmailFetcher(IncludeLabel, ExcludeLabel, FetchCount, lastCreatedAt);
  const values = fetcher.fetchMessages().map((m) => {
    return [m.threadLink, m.threadId, m.createdAt, m.body];
  });
  const filteredValues = values.filter((v) => v !== undefined);

  if (filteredValues.length === 0) {
    SpreadsheetApp.getUi().alert('取得できるFAQデータがありませんでした。');
    return;
  }

  sheet.getRange(sheet.getLastRow() + 1, 1, filteredValues.length, filteredValues[0].length).setValues(filteredValues);
  SpreadsheetApp.getUi().alert(`${filteredValues.length}件のFAQデータを取得しました。`);
}

function getLastCreatedAt(sheet: GoogleAppsScript.Spreadsheet.Sheet): string | null {
  let lastCreatedAt = null;
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) { // ヘッダー行を除く
    const createdAtCell = sheet.getRange(lastRow, SHEET_CONFIG.COLUMNS.CREATED_AT);
    lastCreatedAt = createdAtCell.getValue();

    if (lastCreatedAt) {
      // 日付形式であることを確認
      if (lastCreatedAt instanceof Date) {
        lastCreatedAt = Utilities.formatDate(lastCreatedAt, "JST", "yyyy/MM/dd");
      } else if (typeof lastCreatedAt === 'string') {
        // すでに文字列形式の場合はそのまま使用
      } else {
        // 形式が不明の場合はnullに戻す
        lastCreatedAt = null;
      }
    }
  }

  return lastCreatedAt;
}

function getFAQSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FaqSheetName) || ss.insertSheet(FaqSheetName);
  return sheet;
}