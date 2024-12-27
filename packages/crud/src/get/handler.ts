import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/utils/ApiProxy";
import {
  getBoardCommentListByPageData,
  getBoardDetailData,
  getBoardListByPageData, getBoardListBySearchAndPageData,
  getBoardListBySearchData,
  getBoardListData
} from "../../crudFunction";

const tableName: string = process.env.DYNAMODB_TABLE ?? '';

// 1. 전체 게시판 리스트 조회(페이징 처리 X, 검색 조건 X)
export const getBoardList: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {

  return newApiResponse(200, await getBoardListData(tableName));
};

// 2. 전체 게시판 리스트 조회(페이징 처리 X, 검색 조건 O)
export const getBoardListBySearch: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const searchKeyword: string = event.queryStringParameters?.searchKeyword ?? '';

  return newApiResponse(200, await getBoardListBySearchData(tableName, searchKeyword));
};

// 3. 전체 게시판 리스트 조회(페이징 처리 O, 검색 조건 X)
export const getBoardListByPage: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const page: number = Number(event.queryStringParameters?.page) ?? 1;
  const size: number = Number(event.queryStringParameters?.size) ?? 1;

  return newApiResponse(200, await getBoardListByPageData(tableName,size,  page));
};

// 4. 전체 게시판 리스트 조회(페이징 처리 O, 검색 조건 O)
export const getBoardListBySearchAndPage: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const page: number = Number(event.queryStringParameters?.page) ?? 1;
  const size: number = Number(event.queryStringParameters?.size) ?? 1;
  const searchKeyword: string = event.queryStringParameters?.searchKeyword ?? '';

  return newApiResponse(200, await getBoardListBySearchAndPageData(tableName, searchKeyword, size, page));
};

// 5. 게시판 상세 조회(단건 조회)
export const getBoardDetail: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const boardKey: string = event.pathParameters?.boardKey ?? '';

  return newApiResponse(200, await getBoardDetailData(tableName, boardKey));
};

// 6. 게시판 별 댓글 조회(페이징 처리 O)
export const getBoardCommentListByPage: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const boardKey: string = event.pathParameters?.boardKey ?? '';
  const page: number = Number(event.queryStringParameters?.page) ?? 1;
  const size: number = Number(event.queryStringParameters?.size) ?? 1;

  return newApiResponse(200, await getBoardCommentListByPageData(tableName, boardKey, size, page));
}
