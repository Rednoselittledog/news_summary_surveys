import { create } from 'zustand';
import { NewsItem, CompareAnswer, RatingAnswer, SurveyMode, ModelName } from './types';

interface SurveyStore {
  // Configuration
  newsCount: number;
  mode: SurveyMode | null;
  sessionId: string | null;

  // Selected news items
  selectedNews: NewsItem[];
  currentIndex: number;

  // Shuffled models for compare mode
  shuffledModels: Record<string, ModelName[]>;

  // Answers
  compareAnswers: CompareAnswer[];
  ratingAnswers: RatingAnswer[];

  // Actions
  setNewsCount: (count: number) => void;
  setMode: (mode: SurveyMode) => void;
  setSessionId: (id: string) => void;
  setSelectedNews: (news: NewsItem[]) => void;
  setShuffledModels: (newsId: string, models: ModelName[]) => void;
  nextNews: () => void;
  previousNews: () => void;
  addCompareAnswer: (answer: CompareAnswer) => void;
  addRatingAnswer: (answer: RatingAnswer) => void;
  reset: () => void;
  isLastNews: () => boolean;
  getCurrentNews: () => NewsItem | null;
}

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  // Initial state
  newsCount: 3,
  mode: null,
  sessionId: null,
  selectedNews: [],
  currentIndex: 0,
  shuffledModels: {},
  compareAnswers: [],
  ratingAnswers: [],

  // Actions
  setNewsCount: (count) => set({ newsCount: count }),
  setMode: (mode) => set({ mode }),
  setSessionId: (id) => set({ sessionId: id }),
  setSelectedNews: (news) => set({ selectedNews: news, currentIndex: 0 }),

  setShuffledModels: (newsId, models) =>
    set((state) => ({
      shuffledModels: { ...state.shuffledModels, [newsId]: models }
    })),

  nextNews: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.selectedNews.length - 1)
    })),

  previousNews: () =>
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0)
    })),

  addCompareAnswer: (answer) =>
    set((state) => ({
      compareAnswers: [...state.compareAnswers, answer]
    })),

  addRatingAnswer: (answer) =>
    set((state) => ({
      ratingAnswers: [...state.ratingAnswers, answer]
    })),

  reset: () =>
    set({
      newsCount: 3,
      mode: null,
      sessionId: null,
      selectedNews: [],
      currentIndex: 0,
      shuffledModels: {},
      compareAnswers: [],
      ratingAnswers: []
    }),

  isLastNews: () => {
    const state = get();
    return state.currentIndex === state.selectedNews.length - 1;
  },

  getCurrentNews: () => {
    const state = get();
    return state.selectedNews[state.currentIndex] || null;
  }
}));
