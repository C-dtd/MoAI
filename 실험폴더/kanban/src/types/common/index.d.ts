interface cardtype {
  id: number;
  title: string;
  content: string;
  category: string;
  dateRange?: string | null;      // 선택된 날짜 범위
  startDate?: Date | null; // 시작 날짜
  endDate?: Date | null;   // 종료 날짜
  assignee?:string | null;
}

interface drop {
  dropEffect: string;
  name: string;
}
