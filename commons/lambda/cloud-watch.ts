import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  DescribeLogStreamsCommand,
  CreateLogStreamCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { Context } from 'aws-lambda';

const client = new CloudWatchLogsClient({ region: 'ap-northeast-2' });

export async function logToCloudWatch(message: string, context: Context, apiGatewayName: string) {
  const logGroupName = `/aws/lambda/my-api-gateway-logs`;
  const logStreamName = `logStream-${context.awsRequestId}`;

  console.log(`[API: ${apiGatewayName}] ${message}`);
  console.log('logGroupName:', logGroupName);
  console.log('logStreamName:', logStreamName);

  try {
    // 1. 로그 그룹 및 스트림 존재 여부 확인
    const describeStreamsResponse = await client.send(
        new DescribeLogStreamsCommand({
          logGroupName,
          logStreamNamePrefix: logStreamName,
        })
    );

    let logStream = describeStreamsResponse.logStreams?.find(
        (stream) => stream.logStreamName === logStreamName
    );

    if (!logStream) {
      // 로그 스트림이 없으면 생성
      await client.send(
          new CreateLogStreamCommand({
            logGroupName,
            logStreamName,
          })
      );
      console.log(`Log stream created: ${logStreamName}`);
    } else {
      console.log(`Log stream exists: ${logStreamName}`);
    }

    // 2. 로그 이벤트 전송
    const timestamp = Date.now();
    const logEvents = [
      {
        message: `[API: ${apiGatewayName}] ${message}`,
        timestamp,
      },
    ];

    const nextSequenceToken = logStream?.uploadSequenceToken;

    const putLogEventsResponse = await client.send(
        new PutLogEventsCommand({
          logGroupName,
          logStreamName,
          logEvents,
          ...(nextSequenceToken ? { sequenceToken: nextSequenceToken } : {}),
        })
    );

    console.log('PutLogEventsResponse:', putLogEventsResponse);
  } catch (error) {
    console.error('Error in logToCloudWatch:', error);
  }
}
