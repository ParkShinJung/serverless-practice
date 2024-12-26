import {UserItem} from "./UserItem";

export interface CommentItem {
  PK: string;
  SK: string;
  content: string;
  user: UserItem;
  createdAt: number;
  updatedAt: number;
}
