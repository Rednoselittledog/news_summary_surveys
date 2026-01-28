export type ModelName = 'gpt' | 'pathumma' | 'qwen' | 'typhoon';

export type Category = 'social' | 'economy' | 'technology';

export interface NewsItem {
  id: string;
  category: Category;
  url: string;
  summaries: Record<ModelName, string>;
}

export interface CompareAnswer {
  newsId: string;
  category: Category;
  selectedModel: ModelName;
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

export type SurveyMode = 'compare' | 'rate';
