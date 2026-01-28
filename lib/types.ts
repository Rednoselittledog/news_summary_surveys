export type ModelName = 'gpt' | 'pathumma' | 'qwen' | 'typhoon';

export type Category = 'social' | 'economy' | 'technology';

export interface NewsItem {
  id: string;
  category: Category;
  url: string;
  summaries: Record<ModelName, string>;
}

export interface RatingAnswer {
  newsId: string;
  category: Category;
  modelRatings: Record<ModelName, {
    accuracy: number;
    completeness: number;
    conciseness: number;
    readability: number;
  }>;
}

export interface Demographics {
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation: string;
}

export type Gender = 'male' | 'female' | 'other';

export const OCCUPATIONS = [
  'นักเรียน/นักศึกษา',
  'ข้าราชการ/พนักงานรัฐวิสาหกิจ',
  'พนักงานบริษัทเอกชน',
  'ธุรกิจส่วนตัว/ฟรีแลนซ์',
  'เกษตรกร',
  'แม่บ้าน/พ่อบ้าน',
  'เกษียณอายุ',
  'อื่นๆ'
] as const;

export type Occupation = typeof OCCUPATIONS[number];
