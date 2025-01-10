import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {BoardUpdateRequest, getBoardDetailData, updateBoardData} from "../../crudFunction";
import {BoardItem} from "../../../../commons/item/BoardItem";
import {newApiResponse} from "../../../../commons/ApiProxy";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const updateBoard: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: BoardUpdateRequest = parseBody<BoardUpdateRequest>(event);

  const boardItem: BoardItem = await getBoardDetailData(tableName, requestBody.boardId);
  if (!boardItem.PK) {
    return newApiResponse(404, "Board not found.");
  }

  await updateBoardData(tableName, boardItem, requestBody);

  return newApiResponse(200, "Board updated successfully.");
}
