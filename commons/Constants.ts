import {BoardItem} from "./item/BoardItem";
import {UserItem} from "./item/UserItem";
import {CommentItem} from "./item/CommentItem";

export const Constants = {
  BOARD: "BOARD",
  BOARD_PREFIX: "BOARD#",

  COMMENT_PREFIX: "COMMENT#",

  USER: "USER",
  USER_PREFIX: "USER#",

  FILE: "FILE",
  FILE_PREFIX: "FILE#",

  // DynamoDB
  EMPTY_BOARD_ITEM: {} as BoardItem,
  EMPTY_USER_ITEM: {} as UserItem,
  EMPTY_COMMENT_ITEM: {} as CommentItem,

  // JWT
  ACCESS_TOKEN_EXPIRATION: '1d',
  REFRESH_TOKEN_EXPIRATION: '7d',

  ACCESS_TOKEN_EXPIRATION_MILLIS: 1 * 24 * 60 * 60 * 1000,
  REFRESH_TOKEN_EXPIRATION_MILLIS: 7 * 24 * 60 * 60 * 1000,
}
