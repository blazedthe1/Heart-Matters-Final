export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  published: boolean;
  createdAt: string;
}

export const articles: Article[] = [];
