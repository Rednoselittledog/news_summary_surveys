import { NewsItem, Category, ModelName } from './types';

export async function loadNewsData(): Promise<Record<Category, NewsItem[]>> {
  const response = await fetch('/all_sum.json');
  const data = await response.json();

  const newsData: Record<Category, NewsItem[]> = {
    social: [],
    economy: [],
    technology: []
  };

  // Parse data structure
  Object.keys(data.news_data).forEach((category) => {
    const categoryKey = category as Category;
    const categoryData = data.news_data[category];

    Object.keys(categoryData).forEach((newsId) => {
      const news = categoryData[newsId];
      newsData[categoryKey].push({
        id: newsId,
        category: categoryKey,
        url: news.url,
        summaries: news.summaries
      });
    });
  });

  return newsData;
}

export function selectNewsItems(
  allNews: Record<Category, NewsItem[]>,
  count: number
): NewsItem[] {
  const itemsPerCategory = count / 3;

  const selected: NewsItem[] = [
    ...allNews.social.slice(0, itemsPerCategory),
    ...allNews.economy.slice(0, itemsPerCategory),
    ...allNews.technology.slice(0, itemsPerCategory)
  ];

  // Shuffle the array
  return selected.sort(() => Math.random() - 0.5);
}

export function shuffleModels(models: ModelName[]): ModelName[] {
  return [...models].sort(() => Math.random() - 0.5);
}

export function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export const MODEL_NAMES: ModelName[] = ['gpt', 'pathumma', 'qwen', 'typhoon'];
