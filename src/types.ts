export type ImageResolution = '1K' | '2K' | '4K';

export interface StoryPageData {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  illustrationUrl?: string;
  isGeneratingIllustration?: boolean;
}

export interface StoryData {
  id: string;
  title: string;
  hero: string;
  tagline: string;
  icon: string;
  themeColor: string;
  pages: StoryPageData[];
}

export interface ChatMessageData {
  id: string;
  sender: 'user' | 'owl';
  text: string;
  timestamp: number;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
}

export interface CustomStoryResponse {
  title: string;
  summary: string;
  pages: StoryPage[];
}

