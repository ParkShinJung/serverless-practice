import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda';
import {verifyToken} from "./utils/SecurityUtils";
import {JwtPayload} from "jsonwebtoken";
import {InvalidTokenError} from "./error/CustomError";
import {validateEnvVars} from "./utils/CommonUtils";
import {Constants} from "./Constants";
// import {findUserByKey} from "../packages/user/UserFuctions";


type LambdaHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

/**
 * JWT 인증이 필요 없는 핸들러를 위한 API Proxy
 */
export const apiProxy = (handler: LambdaHandler): APIGatewayProxyHandler => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      validateEnvVars();
      return await handler(event);
    } catch (error) {
      console.error("Error:", error);
      return newApiResponse(500, "Internal server error");
    }
  };
};


/**
 * JWT 인증이 필요한 핸들러를 위한 API Proxy
 */
// export const authApiProxy = (handler: LambdaHandler): APIGatewayProxyHandler => {
//   return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     try {
//       validateEnvVars();
//
//       const tokenHeader = event.headers.Authorization ?? event.headers.authorization;
//       if (!tokenHeader) {
//         return newApiResponse(401, "Authorization token is required");
//       }
//
//       const token = tokenHeader.split(' ')[1];
//       const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
//       const body = event.body ? JSON.parse(event.body) : {};
//
//       body.user = await findUserByKey(decoded.pk, decoded.sk, process.env.DYNAMODB_TABLE!);
//       event.body = JSON.stringify(body);
//
//       return await handler(event);
//     } catch (error) {
//       if (error instanceof TokenExpiredError) {
//         console.error("Error:", error);
//         return newApiResponse(401, "Token has expired");
//       }
//
//       if (error instanceof InvalidTokenError) {
//         console.error("Error:", error);
//         return newApiResponse(401, "Invalid token with pk and sk");
//       }
//
//       console.error("Error:", error);
//       return newApiResponse(500, "Internal server error");
//     }
//   };
// };


/**
 * Admin 권한이 필요한 핸들러를 위한 API Proxy
 */
export const adminApiProxy = (handler: LambdaHandler): APIGatewayProxyHandler => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      validateEnvVars();

      // Authorization 헤더에서 토큰 추출
      const tokenHeader = event.headers.Authorization ?? event.headers.authorization;
      if (!tokenHeader) {
        return newApiResponse(401, "Authorization token is required");
      }

      const token = tokenHeader.split(' ')[1];
      const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
      const pk: string = decoded.pk;
      const sk: string = decoded.sk;

      // 권한 검증 (Admin 확인)
      if (pk !== Constants.ADMIN) {
        return newApiResponse(403, "Forbidden");
      }

      const body = event.body ? JSON.parse(event.body) : {};
      body.adminPk = pk;
      body.adminSk = sk;
      event.body = JSON.stringify(body);

      return await handler(event);

    } catch (error: any) {
      // TokenExpiredError 처리
      if (error.name === 'TokenExpiredError') {
        console.error("TokenExpiredError caught:", error);
        return newApiResponse(401, "Token has expired");
      }

      // InvalidTokenError 처리
      if (error instanceof InvalidTokenError) {
        console.error("InvalidTokenError caught:", error);
        return newApiResponse(401, "Invalid token with pk and sk");
      }

      console.error("Unhandled error:", error); // 기타 에러 로깅
      return newApiResponse(500, "Internal server error");
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
