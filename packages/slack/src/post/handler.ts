import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";

const slackBotOauthToken: string = process.env.SLACK_BOT_OAUTH_KEY ?? '';
const slackUserId: string = process.env.SLACK_USER_KEY ?? '';
const slackChannelId: string = process.env.SLACK_CHANNEL_KEY ?? '';
const slackApiUrl: string = "https://slack.com/api/chat.postMessage";

// 1. 해당 api 실행시 개인 에게 전송(App 채팅 으로 전송됨)
export const sendSlackAppNotice: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    // 메시지 요청 본문
    const messagePayload = {
      channel: slackUserId,
      text: "안녕하세요! 이 메시지는 개인 알림봇에서 보낸 것입니다. 🎉",
    };

    // Slack API 호출
    const response = await axios.post(slackApiUrl, messagePayload, {
      headers: {
        Authorization: `Bearer ${slackBotOauthToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Slack 알림 전송 성공", response: response.data }),
    };
  } catch (error) {
    console.error("Slack 메시지 전송 오류:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Slack 알림 전송 실패", error: error }),
    };
  }
};

// 2. 해당 api 실행시 채널에 전송(특정 채널로 전송)
export const sendSlackChannelNotice: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  try {
    // 메시지 요청 본문
    const messagePayload = {
      channel: slackChannelId,  // 채널 ID를 사용
      text: "안녕하세요! 이 메시지는 채널 알림봇에서 보낸 것입니다. 🎉",
    };

    // Slack API 호출
    const response = await axios.post(slackApiUrl, messagePayload, {
      headers: {
        Authorization: `Bearer ${slackBotOauthToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Slack 알림 전송 성공", response: response.data }),
    };
  } catch (error) {
    console.error("Slack 메시지 전송 오류:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Slack 알림 전송 실패", error: error }),
    };
  }
};
