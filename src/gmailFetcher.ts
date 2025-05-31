class GmailFetcher {
  /**
   * 取得対象のメールのラベル名
   */
  private includeLabel: string;
  /**
   * 除外するメールのラベル名。重複防止のため、取得した後に付与される。
   */
  private excludeLabel: string;
  /**
   * 一度に取得するメールの件数。Gmail Appの制限があるため。
   */
  private fetchCount: number;
  /**
   * 指定した日付以前のメールを取得する。yyyy/MM/dd形式。
   */
  private beforeDate: string | null;

  constructor(includeLabel: string, excludeLabel: string, fetchCount: number, beforeDate: string | null = null) {
    this.includeLabel = includeLabel;
    this.excludeLabel = excludeLabel;
    this.fetchCount = fetchCount;
    this.beforeDate = beforeDate;
  }

  /**
   * 取得条件
   * - includeLabel: 取得対象のメールのラベル名
   * - excludeLabel: 除外するメールのラベル名。取得後に付与される。
   * - fetchCount: 一度に取得するメールの件数。Gmail Appの制限があるため。
   * - beforeDate: 指定した日付以前のメールを取得する。yyyy/MM/dd形式。
   *
   * and
   *
   * - 返信が付いていること
   *
   * メッセージの加工処理:
   * - Mail Delivery Subsystemからのメッセージを除外
   * - 改行文字を\nに統一
   * - 設定されたフッターを除去
   * - 引用行（>で始まる行）を除去
   * - From/To情報を各メッセージの先頭に追加
   * - スレッド内のメッセージを"----"で区切って結合
   */
  public fetchMessages() {
    let query = `-label:${this.excludeLabel} label:${this.includeLabel}`;

    // 日付の条件を追加（指定された日付以前のメールを取得）
    if (this.beforeDate) {
      const formattedDate = this.formatDateForQuery(this.beforeDate);
      query += ` before:${formattedDate}`;
      Logger.log(`Using date filter: before:${formattedDate}`);
    }

    let threads = GmailApp.search(query, 0, this.fetchCount);
    Logger.log(`Gmail Fetched: ${threads.length}`);
    threads = threads.filter(th => th.getMessages().length >= 2); // 返信が付いているものだけ。

    const result = threads.map((thread) => {
      const message = thread.getMessages();
      return {
        threadId: thread.getId(),
        threadLink: thread.getPermalink(),
        createdAt: Utilities.formatDate(message[0].getDate(), "JST", "yyyy/MM/dd"),
        body: this.getThreadMessages(thread.getId()).join("\n----\n")
      };
    });
    GmailApp.getUserLabelByName(this.excludeLabel).addToThreads(threads);
    return result;
  }

  /**
   * スレッドの日付をGmailクエリの形式に変換する
   * @param dateStr yyyy/MM/dd形式の日付文字列
   * @returns yyyy/m/d形式の日付文字列（Gmailクエリ用）
   */
  private formatDateForQuery(dateStr: string): string {
    // yyyy/MM/dd形式をDate型に変換
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      return dateStr; // 形式が異なる場合はそのまま返す
    }

    // Gmailクエリで使用する形式に変換（yyyy/m/d）
    // 注意: Gmail検索では月と日の先頭の0は不要
    const year = parts[0];
    const month = Number.parseInt(parts[1], 10).toString(); // 先頭の0を削除
    const day = Number.parseInt(parts[2], 10).toString();   // 先頭の0を削除

    return `${year}/${month}/${day}`;
  }

  private getThreadMessages(threadId: string) {
    const thread = GmailApp.getThreadById(threadId);
    const messages = thread.getMessages();
    const filteredMessages = this.filterMailDeliverySystem(messages);
    return filteredMessages.map((message) => {
      const trimmed = this.cleanEmailBody(message.getPlainBody());
      return `${this.formatFromTo(message.getFrom(), message.getTo())}\n${trimmed}`;
    });
  }

  private filterMailDeliverySystem(messages: GoogleAppsScript.Gmail.GmailMessage[]) {
    return messages.filter((message) => {
      return !message.getFrom().includes("Mail Delivery Subsystem");
    });
  }

  /* Email Formatters */
  private cleanEmailBody(emailBody: string): string {
    let cleanedBody = this.regularizeNewLine(emailBody);
    cleanedBody = this.removeFooter(cleanedBody);
    cleanedBody = this.removeQuote(cleanedBody);
    return cleanedBody;
  }

  /**
   * convert any new line to \n
   */
  private regularizeNewLine(emailBody: string): string {
    return emailBody.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  private removeFooter(emailBody: string): string {
    const footerMarkers = FooterToRemove;

    let earliestIndex = emailBody.length;
    for (const marker of footerMarkers) {
      const index = emailBody.indexOf(marker);
      if (index !== -1 && index < earliestIndex) {
        earliestIndex = index;
      }
    }

    return emailBody.substring(0, earliestIndex).trim();
  }

  private removeQuote(emailBody: string): string {
    return emailBody
      .split("\n")
      .filter(line => {
        return !line.startsWith(">"); // delete quoted lines
      })
      .join("\n")
      .trim();
  }

  private formatFromTo(from: string, to: string) {
    return `From: ${from} -> To: ${to}`;
  }
}
