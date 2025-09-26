export interface ThreadType {
  id: string;
  photo_profile?: string | null;
  full_name: string;
  username?: string | null;
  age?: string | null;
  content?: string | null;
  image?: string | null;
  number_of_likes: number;
  number_of_replies: number;
  created_by: string;
  isLiked?: boolean;
}
