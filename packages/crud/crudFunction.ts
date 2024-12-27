import {SK, TableName} from "../../commons/type/Types";
import {BoardItem} from "../../commons/item/BoardItem";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {getItem, getQueryItem} from "../../commons/dynamo/dynamoCommands";
import {QueryCommandInput} from "@aws-sdk/client-dynamodb";
import {Constants} from "../../commons/Constants";
import {UserItem} from "../../commons/item/UserItem";

export interface BoardCreateRequest {
  title: string;
  content: string;
  userSk: SK;
  description: string;
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
