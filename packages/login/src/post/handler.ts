import {PK, TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/ApiProxy";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {findUserByEmail} from "../../../crud/crudFunction";
import {
  generateAccessToken, refreshToken,
  TokenResponse,
  verifyPassword
} from "../../../../commons/utils/SecurityUtils";
import {UserItem} from "../../../../commons/item/UserItem";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  user: UserItem;
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

export const userLogin: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const request = parseBody<UserLoginRequest>(event);
  if (!request.email || !request.password) {
    return newApiResponse(400, "Email and password are required.");
  }

  const userItem = await findUserByEmail(tableName, request.email);

  if (!userItem.PK) {
    return newApiResponse(404, "User not found.");
  }

  const passwordMatch: boolean = await verifyPassword(request.password, userItem.password);
  if (!passwordMatch) {
    return newApiResponse(404, "Incorrect password.");
  }

  const pk: PK = userItem.PK;
  const sk: PK = userItem.SK;
  const accessToken: TokenResponse = generateAccessToken(pk, sk);
  const refreshToken: TokenResponse = generateAccessToken(pk, sk);

  const response: UserLoginResponse = {
    user: userItem,
    accessToken: accessToken.token,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt
  };

  return newApiResponse(200, response);
};

export const refreshAccessToken: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestBody: string = event.body ?? '{}';
  const {refreshToken: providedRefreshToken} = JSON.parse(requestBody);

  if (!providedRefreshToken) {
    return newApiResponse(400, "Refresh token is required.");
  }

  const newAccessToken = refreshToken(providedRefreshToken);
  return newApiResponse(200, {accessToken: newAccessToken});
};

