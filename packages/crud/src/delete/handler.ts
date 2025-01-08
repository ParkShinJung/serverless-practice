import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/ApiProxy";
import {BoardItem} from "../../../../commons/item/BoardItem";
import {deleteBoardData, getBoardDetailData} from "../../crudFunction";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const deleteBoard: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {boardSk} = JSON.parse(event.body ?? '{}');
  if (!boardSk) {
    return newApiResponse(400, "The 'algorithmName' field required");
  }
  const boardItem: BoardItem = await getBoardDetailData(tableName, boardSk);

  if (!boardItem.PK) {
    return newApiResponse(404, "Board not found.")
  }

  await deleteBoardData(tableName, boardSk);

  return newApiResponse(200, "Board deleted successfully.")
};
