import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {
  BoardCreateRequest,
  createNewBoardItem,
  getUserDetailData,
  saveBoard
} from "../../crudFunction";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {newApiResponse} from "../../../../commons/ApiProxy";
import {UserItem} from "../../../../commons/item/UserItem";
import {BoardItem} from "../../../../commons/item/BoardItem";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

// 1. 게시판 생성
export const createBoard: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: 추 후에 proxy 적용 시에 requestBody 로 user 정보 받아 오는거 없애기
  const request: BoardCreateRequest = parseBody<BoardCreateRequest>(event);

  const userItem: UserItem = await getUserDetailData(tableName, request.userSk);
  if (!userItem) {
    return newApiResponse(404, "User not found.");
  }

  const boardItem: BoardItem = createNewBoardItem(request, userItem);
  await saveBoard(boardItem, tableName);

  return newApiResponse(200, "Board created successfully");
}
