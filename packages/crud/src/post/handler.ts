import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {BoardCreateRequest} from "../../crudFunction";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {newApiResponse} from "../../../../commons/ApiProxy";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export const createBoard: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const request: BoardCreateRequest = parseBody<BoardCreateRequest>(event);

  return newApiResponse(200, "");
}
