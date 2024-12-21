import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/utils/ApiProxy";
import {getBoardListData} from "../../crudFunction";

const tableName: string = process.env.DYNAMODB_TABLE ?? '';

export const getBoardList: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  return newApiResponse(200, await getBoardListData(tableName));
};
