export interface UserType {
  id: string;
  username?: string;
  full_name: string;
  email: string;
  photo_profile?: string;
  bio?: string;
  isFollowed?: boolean;
}
