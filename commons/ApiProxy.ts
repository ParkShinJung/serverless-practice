import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {validateEnvVars} from "./utils/CommonUtils";

type LambdaHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

/**
 * JWT 인증이 필요 없는 핸들러를 위한 API Proxy
 */
export const apiProxy = (handler: LambdaHandler): APIGatewayProxyHandler => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      validateEnvVars();
      return await handler(event);
    } catch (error: unknown) {
      const err = error as Error; // 타입 강제

      // CloudWatch Logs에 에러 메시지와 스택 트레이스를 기록
      console.error("Error occurred:", err.message);
      console.error("Stack trace:", err.stack);

      // 클라이언트에는 단순한 메시지만 전달
      return newApiResponse(500, {
        message: "Internal server error",
        errorMessage: err.message,  // 응답에 에러 메시지 포함
        stack: err.stack,           // 응답에 스택 트레이스 포함
      });
    }
  };
};


/**
 * API Response Helper
 */
export const newApiResponse = (statusCode: number, body: any, message?: string): APIGatewayProxyResult => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
  if (message) {
    return {
      statusCode: statusCode,
      headers: headers,
      body: JSON.stringify({message: message, body: body}),
    };
  }
  return {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(body),
  };
};
