function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('PTNAツール');

  menu.addItem('FAQ作成Colabを開く', 'openFaqColab');
  menu.addItem('FAQデータ取得', 'main');
  menu.addItem('FAQデータをJSONLでエクスポート', 'exportFAQDataAndShowUrl');
  menu.addToUi();
}

/**
 * FAQデータをJSONL形式にエクスポートし、URLを表示する
 *
 * For Vertex AI Agent Builder
 */
function exportFAQDataAndShowUrl() {
  try {
    const url = exportFAQDataToJSONL();
    const ui = SpreadsheetApp.getUi();
    ui.alert('エクスポート完了', `FAQデータをJSONL形式でエクスポートしました。\n${url}`, ui.ButtonSet.OK);
  } catch (error) {
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', `エクスポート中にエラーが発生しました。\n${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * FAQ作成補助用のColabページを開く
 */
function openFaqColab() {
  const htmlOutput = HtmlService.createHtmlOutput(
    `<script>
      window.open('${colabUrl}', '_blank');
      google.script.host.close();
    </script>`
  );

  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, 'Colabページを開いています...');
}
