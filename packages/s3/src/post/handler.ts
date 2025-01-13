import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/ApiProxy";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

// 파일 업로드
export const fileUpload: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  return newApiResponse(200, "File uploaded successfully");
}

// 파일 다운로드
export const fileDownload: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return newApiResponse(200, "File uploaded successfully");
}

// 파일 삭제
export const fileDelete: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  return newApiResponse(200, "File uploaded successfully");
}
