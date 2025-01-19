import {PK, SK, TableName} from "../../commons/type/Types";
import {BoardItem} from "../../commons/item/BoardItem";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {deleteItem, getItem, getQueryItem, putItem} from "../../commons/dynamo/dynamoCommands";
import {QueryCommandInput} from "@aws-sdk/client-dynamodb";
import {Constants} from "../../commons/Constants";
import {UserItem} from "../../commons/item/UserItem";
import {newBoardSK, newCommentSK, newUserSK, timestamp} from "../../commons/utils/CommonUtils";
import {CommentItem} from "../../commons/item/CommentItem";
import {hashPassword} from "../../commons/utils/SecurityUtils";

export interface BoardCreateRequest {
  title: string;
  content: string;
  userSk: SK;
  description?: string;
}

export interface CommentAddRequest {
  boardSk: string;
  content: string;
  userSk: SK;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  birth: string;
}

export const getBoardListData = async (tableName: TableName): Promise<Array<BoardItem>> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: marshall({
      ":pk": Constants.BOARD
    }, { removeUndefinedValues: true })  // 옵션 추가
  }
  const result = await getQueryItem(params);
  return result.Items ? result.Items.map(item => unmarshall(item) as BoardItem) : [];
}

export const getBoardListBySearchData = async (tableName: TableName, search: string): Promise<Array<BoardItem>> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :pk",
    FilterExpression: "contains(title, :search)",
    ExpressionAttributeValues: marshall({
      ":pk": Constants.BOARD,
      ":search": search
    }, { removeUndefinedValues: true })  // 옵션 추가
  }
  const result = await getQueryItem(params);
  return result.Items ? result.Items.map(item => unmarshall(item) as BoardItem) : [];
}

export const getBoardListByPageData = async (tableName: string, page: number, size: number): Promise<Array<BoardItem>> => {
  let lastEvaluatedKey: any = null;
  let currentPage = 1;
  let items: Array<BoardItem> = [];

  while (currentPage <= page) {
    const params: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: marshall({
        ":pk": Constants.BOARD, // Replace with the actual partition key value
      }),
      Limit: size,

      ExclusiveStartKey: lastEvaluatedKey, // 페이징 처리의 핵심
    };
    // DynamoDB Query 실행
    const result = await getQueryItem(params);
    // 페이징 진행
    lastEvaluatedKey = result.LastEvaluatedKey;
    // 필요한 페이지 도달 시 데이터 수집
    if (currentPage === page) {
      items = result.Items ? result.Items.map((item) => unmarshall(item) as BoardItem) : [];
    }
    // 더 이상 데이터가 없으면 종료
    if (!lastEvaluatedKey) {
      break;
    }
    currentPage++;
  }
  return items;
};

export const getBoardListBySearchAndPageData = async (
    tableName: string, searchKeyword: string, page: number, size: number): Promise<Array<BoardItem>> => {
  let lastEvaluatedKey: any = null;
  let currentPage = 1;
  let items: Array<BoardItem> = [];

  while (currentPage <= page) {
    const params: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :searchKeyword)",
      ExpressionAttributeValues: marshall({
        ":pk": Constants.BOARD, // Replace with your partition key
        ":searchKeyword": searchKeyword,
      }),
      Limit: size,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    const result = await getQueryItem(params);
    // 마지막 페이지의 아이템만 저장
    if (currentPage === page) {
      items = result.Items ? result.Items.map((item) => unmarshall(item) as BoardItem) : [];
    }
    lastEvaluatedKey = result.LastEvaluatedKey;
    // 더 이상 데이터가 없으면 반복 종료
    if (!lastEvaluatedKey) {
      break;
    }
    currentPage++;
  }
  return items;
};

export const getBoardDetailData = async (tableName: string, boardId: string): Promise<BoardItem> => {
  const params = {
    TableName: tableName,
    Key: marshall({
      PK: Constants.BOARD,
      SK: boardId
    }, { removeUndefinedValues: true })
  }
  const result = await getItem(params);
  return result.Item ? unmarshall(result.Item) as BoardItem : Constants.EMPTY_BOARD_ITEM;
}

export const getCommentDetailData = async (tableName: string, boardId: string, commentId: string): Promise<CommentItem> => {
  const params = {
    TableName: tableName,
    Key: marshall({
      PK: boardId,
      SK: commentId
    }, { removeUndefinedValues: true })
  }
  const result = await getItem(params);
  return result.Item ? unmarshall(result.Item) as CommentItem : Constants.EMPTY_COMMENT_ITEM;
}

export const getBoardCommentListByPageData = async (tableName: string, boardId: string, page: number, size: number): Promise<Array<BoardItem>> => {
  let lastEvaluatedKey: any = null;
  let currentPage = 1;
  let items: Array<BoardItem> = [];

  while (currentPage <= page) {
    const params: QueryCommandInput = {
      TableName: tableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :comment)",
      ExpressionAttributeValues: marshall({
        ":pk": boardId,
        ":comment": Constants.COMMENT_PREFIX,
      }),
      Limit: size,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    const result = await getQueryItem(params);
    if (currentPage === page) {
      items = result.Items ? result.Items.map((item) => unmarshall(item) as BoardItem) : [];
    }
    lastEvaluatedKey = result.LastEvaluatedKey;
    if (!lastEvaluatedKey) {
      break;
    }
    currentPage++;
  }
  return items;
}

export const getUserListData = async (tableName: TableName): Promise<Array<UserItem>> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: marshall({
      ":pk": Constants.USER
    }, { removeUndefinedValues: true })  // 옵션 추가
  }
  const result = await getQueryItem(params);
  return result.Items ? result.Items.map(item => unmarshall(item) as UserItem) : [];
}

export const getUserDetailData = async (tableName: TableName, userKey: string): Promise<UserItem> => {
  const params = {
    TableName: tableName,
    Key: marshall({
      PK: Constants.USER,
      SK: userKey
    }, { removeUndefinedValues: true })
  }
  const result = await getItem(params);
  return result.Item ? unmarshall(result.Item) as UserItem : Constants.EMPTY_USER_ITEM;
}

export const createNewBoardItem = (request: BoardCreateRequest, userItem: UserItem): BoardItem => {
  return {
    PK: Constants.BOARD,
    SK: newBoardSK(),
    title: request.title,
    content: request.content,
    user: userItem,
    description: request.description,
    createdAt: timestamp()
  }
}

export const saveBoard = async (boardItem: BoardItem, tableName: TableName): Promise<void> => {
  const putParams = {
    TableName: tableName,
    Item: marshall(boardItem)
  };

  await putItem(putParams);
}

export const createNewCommentItem = (request: CommentAddRequest, userItem: UserItem): CommentItem => {
  return {
    PK: request.boardSk,
    SK: newCommentSK(),
    content: request.content,
    user: userItem,
    createdAt: timestamp()
  }
}

export const saveComment = async (commentItem: CommentItem, tableName: TableName): Promise<void> => {
  const putParams = {
    TableName: tableName,
    Item: marshall(commentItem)
  };

  await putItem(putParams);
}

export const createNewUserItem = async (request: UserCreateRequest): Promise<UserItem> => {
  return {
    PK: Constants.USER,
    SK: newUserSK(),
    email: request.email,
    name: request.name,
    password: await hashPassword(request.password),
    birth: request.birth,
    createdAt: timestamp()
  }
}

export const saveUser = async (userItem: UserItem, tableName: TableName): Promise<void> => {
  const putParams = {
    TableName: tableName,
    Item: marshall(userItem)
  };

  await putItem(putParams);
}

export const findUserByEmail = async (tableName: string, email: string): Promise<UserItem> => {
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: "PK = :pk",
    FilterExpression: "#email = :email",
    ExpressionAttributeNames: {
      "#email": "email",
    },
    ExpressionAttributeValues: marshall(
        {
          ":pk": Constants.USER,
          ":email": email,
        },
        {removeUndefinedValues: true}
    ),
  };

  const result = await getQueryItem(params);

  // 결과 처리
  if (result.Items && result.Items.length > 0) {
    return unmarshall(result.Items[0]) as UserItem;
  }

  return Constants.EMPTY_USER_ITEM;
}

export const deleteBoardData = async (tableName: TableName, sk: SK): Promise<void> => {
  const userParams = {
    TableName: tableName,
    Key: marshall({PK: Constants.BOARD, SK: sk})
  };

  await deleteItem(userParams);
};

export const deleteCommentByBoardData = async (tableName: TableName, boardId: PK): Promise<void> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :pk and begins_with(SK, :prefix)",
    ExpressionAttributeValues: marshall({
      ":pk": boardId,
      ":prefix": {S: Constants.COMMENT_PREFIX}
    }, { removeUndefinedValues: true })
  };
  const result = await getQueryItem(params);
  if (result.Items) {
    for (const item of result.Items) {
      const commentItem = unmarshall(item) as CommentItem;
      await deleteCommentData(tableName, boardId, commentItem.SK);
    }
  }
}

export const deleteCommentData = async (tableName: TableName, boardId: PK, commentId: SK): Promise<void> => {
  const userParams = {
    TableName: tableName,
    Key: marshall({PK: boardId, SK: commentId})
  };

  await deleteItem(userParams);
};

export const deleteUserData = async (tableName: TableName, userId: SK): Promise<void> => {
  const userParams = {
    TableName: tableName,
    Key: marshall({PK: Constants.USER, SK: userId})
  };

  await deleteItem(userParams);
};
