export type SupportedLocale = 'th' | 'en' | 'zh' | 'ja' | 'ko';

export const SUPPORTED_LOCALES: Array<{ code: SupportedLocale; label: string }> = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

export const HOTEL_COPY: Record<SupportedLocale, Record<string, string>> = {
  th: {
    checkInReminder: 'สวัสดีค่ะ/ครับ พรุ่งนี้เป็นวันเช็กอินของคุณ หากต้องการความช่วยเหลือเพิ่มเติมสามารถตอบกลับข้อความนี้ได้เลย',
    checkoutReminder: 'วันนี้เป็นวันเช็กเอาต์ของคุณ หากต้องการฝากกระเป๋าหรือขยายเวลา กรุณาติดต่อพนักงาน',
    paymentReminder: 'ขอแจ้งเตือนยอดชำระคงค้าง กรุณาชำระก่อนวันเข้าพักเพื่อยืนยันการจอง',
    reviewRequest: 'ขอบคุณที่เข้าพักกับเรา หากสะดวก รบกวนรีวิวประสบการณ์ของคุณเพื่อช่วยให้เราพัฒนาบริการ',
  },
  en: {
    checkInReminder: 'Hello, tomorrow is your check-in date. Reply here if you need any help before arrival.',
    checkoutReminder: 'Today is your check-out date. Contact our staff if you need luggage storage or a late check-out request.',
    paymentReminder: 'This is a reminder for your outstanding payment. Please complete payment before arrival to confirm the booking.',
    reviewRequest: 'Thank you for staying with us. We would appreciate your review so we can keep improving our service.',
  },
  zh: {
    checkInReminder: '您好，明天是您的入住日期。如需任何协助，请直接回复此消息。',
    checkoutReminder: '今天是您的退房日期。如需寄存行李或延迟退房，请联系工作人员。',
    paymentReminder: '提醒您仍有未付款项。请在抵达前完成付款以确认预订。',
    reviewRequest: '感谢您的入住。如方便，欢迎留下评价，帮助我们持续改善服务。',
  },
  ja: {
    checkInReminder: 'こんにちは。明日はチェックイン日です。ご到着前にご不明点がございましたら、このメッセージにご返信ください。',
    checkoutReminder: '本日はチェックアウト日です。お荷物のお預かりやレイトチェックアウトをご希望の場合はスタッフまでご連絡ください。',
    paymentReminder: '未払い金額がございます。予約確定のため、ご到着前にお支払いをお願いいたします。',
    reviewRequest: 'ご宿泊ありがとうございました。サービス向上のため、レビューをご投稿いただけますと幸いです。',
  },
  ko: {
    checkInReminder: '안녕하세요. 내일은 체크인 날짜입니다. 도착 전 도움이 필요하시면 이 메시지에 답장해 주세요.',
    checkoutReminder: '오늘은 체크아웃 날짜입니다. 짐 보관 또는 늦은 체크아웃이 필요하시면 직원에게 문의해 주세요.',
    paymentReminder: '미결제 금액이 있습니다. 예약 확정을 위해 도착 전 결제를 완료해 주세요.',
    reviewRequest: '숙박해 주셔서 감사합니다. 서비스 개선을 위해 리뷰를 남겨 주시면 감사하겠습니다.',
  },
};

export function getHotelCopy(locale: string | null | undefined, key: keyof typeof HOTEL_COPY.th) {
  const lang = (locale && locale in HOTEL_COPY ? locale : 'en') as SupportedLocale;
  return HOTEL_COPY[lang][key] || HOTEL_COPY.en[key];
}
