import { create } from 'zustand';
import { NewsItem, RatingAnswer, ModelName, Demographics } from './types';

interface SurveyStore {
  // Configuration
  sessionId: string | null;

  // Selected news items (always 5 items)
  selectedNews: NewsItem[];
  currentIndex: number;

  // Shuffled models for each news item (for color assignment)
  shuffledModels: Record<string, ModelName[]>;

  // Answers
  ratingAnswers: RatingAnswer[];

  // Demographics
  demographics: Demographics | null;

  // Actions
  setSessionId: (id: string) => void;
  setSelectedNews: (news: NewsItem[]) => void;
  setShuffledModels: (newsId: string, models: ModelName[]) => void;
  nextNews: () => void;
  previousNews: () => void;
  addRatingAnswer: (answer: RatingAnswer) => void;
  setDemographics: (demographics: Demographics) => void;
  reset: () => void;
  isLastNews: () => boolean;
  getCurrentNews: () => NewsItem | null;
}

export const useSurveyStore = create<SurveyStore>((set, get) => ({
  // Initial state
  sessionId: null,
  selectedNews: [],
  currentIndex: 0,
  shuffledModels: {},
  ratingAnswers: [],
  demographics: null,

  // Actions
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

  addRatingAnswer: (answer) =>
    set((state) => ({
      ratingAnswers: [...state.ratingAnswers, answer]
    })),

  setDemographics: (demographics) => set({ demographics }),

  reset: () =>
    set({
      sessionId: null,
      selectedNews: [],
      currentIndex: 0,
      shuffledModels: {},
      ratingAnswers: [],
      demographics: null
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
