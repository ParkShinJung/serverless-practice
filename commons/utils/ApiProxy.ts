import {APIGatewayProxyResult} from 'aws-lambda';

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
