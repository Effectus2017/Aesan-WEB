export interface Message {
  id: number;
  icon?: string;
  image?: string;
  title?: string;
  description?: string;
  time: string;
  link?: string;
  useRouter?: boolean;
  read: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
