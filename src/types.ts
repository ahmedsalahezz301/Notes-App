export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email?: string;
};
