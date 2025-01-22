import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { RekognitionClient, DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { S3Client } from "@aws-sdk/client-s3";
import { TableName } from "../../../../commons/type/Types";
import { newApiResponse } from "../../../../commons/ApiProxy";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? "";
const bucketName = process.env.S3_BUCKET_NAME ?? "";

const rekognitionClient = new RekognitionClient({});
const dynamoDBClient = new DynamoDBClient({});
const s3Client = new S3Client({});

export const rekognitionHandler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Step 1: Parse S3 object key from the event body
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body || !body.key) {
      return newApiResponse(400, "S3 object key is required in the body");
    }

    const objectKey = body.key;

    // Step 2: Call Rekognition to analyze the image
    const rekognitionResponse = await rekognitionClient.send(
        new DetectLabelsCommand({
          Image: {
            S3Object: {
              Bucket: bucketName,
              Name: objectKey,
            },
          },
          MaxLabels: 10, // Retrieve up to 10 labels
          MinConfidence: 75, // Confidence threshold
        })
    );

    const labels = rekognitionResponse.Labels?.map(label => ({
      Name: label.Name,
      Confidence: label.Confidence,
    })) ?? [];

    // Step 3: Store the result in DynamoDB
    const putItemCommand = new PutItemCommand({
      TableName: tableName,
      Item: {
        ImageName: { S: objectKey },
        Labels: { S: JSON.stringify(labels) },
      },
    });

    await dynamoDBClient.send(putItemCommand);

    // Step 4: Return success response
    return newApiResponse(200, {
      message: "Image analysis successful",
      labels,
    });
  } catch (error: any) {
    console.error("Error processing image analysis", error);
    return newApiResponse(500, {
      message: "Failed to process image analysis",
      error: error.message,
    });
  }
};
