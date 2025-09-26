export interface ThreadType {
  id: string;
  photo_profile: string | null;
  full_name: string;
  username: string | null;
  age: string | null;
  content: string | null;
  image: string | null;
  number_of_likes: number;
  number_of_replies: number;
  liked_user_ids: string[];
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
}
