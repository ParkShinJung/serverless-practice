import {BoardItem} from "./item/BoardItem";
import {UserItem} from "./item/UserItem";

export const Constants = {
  BOARD: "BOARD",
  BOARD_PREFIX: "BOARD#",

  COMMENT_PREFIX: "COMMENT#",

  USER: "USER",
  USER_PREFIX: "USER#",

  // DynamoDB
  EMPTY_BOARD_ITEM: {} as BoardItem,
  EMPTY_USER_ITEM: {} as UserItem,
}
