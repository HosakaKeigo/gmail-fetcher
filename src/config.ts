/**
 * 取り込みたいスレッドについているラベル名
 */
const IncludeLabel = "お問い合わせ";
/**
 * 処理済みのスレッドに付けるラベル名
 */
const ExcludeLabel = "processed";
/**
 * 取得最大件数
 */
const FetchCount = 100;

/**
 * 取得時に除去するフッター。
 */
const FooterToRemove = [
  "3営業日以内に、担当より改めて回答いたします。",
  "---------- Forwarded message ---------"
];

/** FAQデータを保存するシート名 */
const FaqSheetName = "FAQ";
/** Colabで加工したFAQデータを保存するシート名 */
const FaqSheetNameProcessed = "processed";
const OutputFolderName = "FAQ";

/**
 * FAQ加工用ColabのURL
 */
const colabUrl = '<Your Colab URL here>';

const SHEET_CONFIG = {
  COLUMNS: {
    THREAD_LINK: 1,
    THREAD_ID: 2,
    CREATED_AT: 3,
    BODY: 4
  }
};
