export interface ReplyType {
  id: string;
  thread_id: string;
  photo_profile: string | null;
  full_name: string;
  username: string | null;
  age: string | null;
  content: string | null;
  image: string | null;
  created_by: string;
}
