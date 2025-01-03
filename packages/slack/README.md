# Slack 알림 보내기

---
### 사전 세팅
- 해당 기능을 위해 임의로 슬랙 워크스페이스 생성함<br/>
  <img src="../../commons/image/slack3.png" width="400" height="300" /><br/>
###  1. Slack App 설정
1. Slack App 생성</br>
    - Slack API: Your Apps로 이동.</br>
        - https://api.slack.com/apps
    - "Create New App" → "From Scratch" 선택 후 앱 이름과 워크스페이스 지정.
2. OAuth & Permissions 설정</br>
    - OAuth & Permissions 메뉴로 이동.
    - Scopes 추가:
        - 아래 Scopes를 추가합니다:
            - chat:write: 메시지 전송 권한.
            - users:read: 사용자 정보 조회 권한(필요 시).</br>
              <img src="../../commons/image/slack.png" width="400" height="200" /><br/>
    - "Install to Workspace" 버튼 클릭 → 권한 요청 승인 → Bot User OAuth Token 복사.
    - 환경변수에 입력
3. User ID 확인
    - Slack 워크스페이스에서 사용자 프로필을 클릭하여 ID를 확인합니다.<br/>
      <img src="../../commons/image/slack2.png" width="400" height="250" /><br/>
    - 환경 변수에 입력
4. Channel Id 확인
    - 생성한 App에서 해당 ID를 확인합니다.
      <img src="">


###  2. AWS Lambda 함수 구현
<br/>
---

---
### 관련 에러 종류
1. Slack 메시지 전송 오류: Error: Slack API Error: not_in_channel
    ```bash
    Slack 메시지 전송 오류: Error: Slack API Error: not_in_channel
    at sendSlackChannelNotice (/Users/shinjung/IdeaProjects/serverless-practice/packages/slack/src/post/handler.js:60:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async MessagePort.<anonymous> (file:///Users/shinjung/IdeaProjects/serverless-practice/node_modules/serverless-offline/src/lambda/handler-runner/worker-thread-runner/workerThreadHelper.js:24:14)
    
    (λ: sendSlackChannelNotice) RequestId: 9dee254d-aab1-4d9d-a589-ddae904a8223  Duration: 555.96 ms  Billed Duration: 556 ms
    ```
    * 1. 위의 에러는 채널의 ID 가 잘 못된 경우<br>
        해결: 해당 채널의 ID를 확인합니다.
    * 2. 위의 에러는 해당 채널에 봇이 추가되지 않은 경우 <br>
      해결: 해당 채널에 봇을 추가합니다.
2. Slack 메시지 전송 오류: Error: Slack API Error: account_inactive
    ```bash
   Slack 메시지 전송 오류: Error: Slack API Error: account_inactive
    at sendSlackChannelNotice (/Users/shinjung/IdeaProjects/serverless-practice/packages/slack/src/post/handler.js:60:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async MessagePort.<anonymous> (file:///Users/shinjung/IdeaProjects/serverless-practice/node_modules/serverless-offline/src/lambda/handler-runner/worker-thread-runner/workerThreadHelper.js:24:14)

    (λ: sendSlackChannelNotice) RequestId: 473c51c6-ff57-4a2a-947d-a7d8b1d75898  Duration: 553.00 ms  Billed Duration: 553 ms
    ```
    * 1. 위의 에러는 봇이 비활성화 된 경우<br>
        해결: 봇을 활성화합니다.
    * 2. 위의 에러는 봇이 해당 채널에 추가되지 않은 경우<br>
      해결: 해당 채널에 봇을 추가합니다.
    * 3. 위의 에러는 SLACK_BOT_OAUTH_TOKEN이 외부에 노출된 경우에 비활성화 되는 경우<br>
        해결: 환경 변수에 입력한 SLACK_BOT_OAUTH_TOKEN을 확인합니다.
        해결: SLACK_BOT_OAUTH_TOKEN을 재발급 받습니다.

