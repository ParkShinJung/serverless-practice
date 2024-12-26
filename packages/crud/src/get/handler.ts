import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/utils/ApiProxy";
import {getBoardListData} from "../../crudFunction";

const tableName: string = process.env.DYNAMODB_TABLE ?? '';

// 1. 전체 게시판 리스트 조회(페이징 처리 X, 검색 조건 X)
export const getBoardList: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  return newApiResponse(200, await getBoardListData(tableName));
};
