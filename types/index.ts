export interface Quote {
  id: string;
  text: string;
  attribution: string;
  category: string;
  explanation: string;
  imageUrl: string;
  audioUrl: string;
  reference: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  quoteCount?: number;
}
