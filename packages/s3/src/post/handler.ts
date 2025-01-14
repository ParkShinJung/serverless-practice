import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/ApiProxy";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {toFileUploadRequest, uploadFileRequest} from "../../s3Function";
import {FileItem} from "../../../../commons/item/FileItem";
import {marshall} from "@aws-sdk/util-dynamodb";
import {putItem} from "../../../../commons/dynamo/dynamoCommands";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';
const bucketName = process.env.S3_BUCKET_NAME ?? '';

// 파일 업로드
export const fileUpload: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const request: uploadFileRequest = parseBody<uploadFileRequest>(event);

  // 파일 업로드 이력 저장
  const fileItem: FileItem = toFileUploadRequest(request);
  const metadataParams = {
    TableName: tableName,
    Item: marshall(fileItem, {removeUndefinedValues: true})
  };
  await putItem(metadataParams);

  // S3 버킷에 파일 업로드
  const s3Client = new S3Client({});
  const s3Params = {
    Bucket: bucketName,
    Key: `${fileItem.path}/${fileItem.fileName}`,
    Body: Buffer.from(request.file, 'base64'), // 파일을 Base64로 인코딩하여 업로드
    ContentType: "application/octet-stream"
  };

  try {
    await s3Client.send(new PutObjectCommand(s3Params));
    return newApiResponse(200, "File uploaded successfully");
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return newApiResponse(500, "File upload failed");
  }
};

// 파일 다운로드
export const fileDownload: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return newApiResponse(200, "File uploaded successfully");
}

// 파일 삭제
export const fileDelete: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  return newApiResponse(200, "File uploaded successfully");
}
