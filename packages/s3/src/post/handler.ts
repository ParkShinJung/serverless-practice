import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/ApiProxy";
import {parseBody} from "../../../../commons/utils/CommonUtils";
import {
  downloadFileRequest,
  getFileDetailData,
  toFileUploadRequest,
  uploadFileRequest
} from "../../s3Function";
import {FileItem} from "../../../../commons/item/FileItem";
import {marshall,} from "@aws-sdk/util-dynamodb";
import {deleteItem, putItem} from "../../../../commons/dynamo/dynamoCommands";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import {Readable} from "node:stream";

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

// 파일 다운로드 핸들러
export const fileDownload: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const request: downloadFileRequest = parseBody<downloadFileRequest>(event);

  const fileItem: FileItem = await getFileDetailData(tableName, request.fileId);

  const filePath = `${fileItem.path}/${fileItem.fileName}`;

  // 2️⃣ S3에서 파일 다운로드
  const s3Client = new S3Client({});
  const getObjectParams = {
    Bucket: bucketName,
    Key: filePath
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const s3Response = await s3Client.send(command);

    // 3️⃣ S3에서 다운로드된 파일을 Base64로 변환
    const fileData = await streamToBase64(s3Response.Body as Readable);

    // 4️⃣ 파일 데이터를 Base64로 응답
    return newApiResponse(200, {
      message: "File downloaded successfully",
      fileName: fileItem.fileName,
      fileData: fileData // Base64로 인코딩된 파일 데이터
    });
  } catch (error) {
    console.error("S3 Download Error:", error);
    return newApiResponse(500, "File download failed");
  }
};


// 파일 삭제
export const fileDelete: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const request: downloadFileRequest = parseBody<downloadFileRequest>(event);

  // 1️⃣ DynamoDB에서 파일 정보 조회
  const fileItem: FileItem = await getFileDetailData(tableName, request.fileId);
  if (!fileItem) {
    return newApiResponse(404, "File not found");
  }

  const filePath = `${fileItem.path}/${fileItem.fileName}`;

  // 2️⃣ S3에서 파일 삭제
  const s3Client = new S3Client({});
  const deleteObjectParams = {
    Bucket: bucketName,
    Key: filePath
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteObjectParams));

    // 3️⃣ DynamoDB에서 파일 정보 삭제
    const deleteParams = {
      TableName: tableName,
      Key: marshall({
        PK: "FILE",
        SK: request.fileId
      }, {removeUndefinedValues: true})
    };

    await deleteItem(deleteParams);

    // 4️⃣ 성공 응답 반환
    return newApiResponse(200, {
      message: "File and metadata deleted successfully",
      fileName: fileItem.fileName
    });
  } catch (error) {
    console.error("File Deletion Error:", error);
    return newApiResponse(500, "File deletion failed");
  }
};

// S3 객체를 Base64로 변환하는 함수
const streamToBase64 = async (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    stream.on("error", reject);
  });
};
