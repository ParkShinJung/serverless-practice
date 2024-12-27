import {UserItem} from "./UserItem";

export interface BoardItem {
  PK: string;
  SK: string;
  title: string;
  content: string;
  user: UserItem;
  description?: string;
  createdAt: number;
  updatedAt?: number;
}
