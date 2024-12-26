# 내가 이해하여 만든 서버리스 개발 환경 및 팁

---
### 프로젝트 환경
- **언어**: TypeScript<br/>
- **런타임**: Node.js 20<br/>
- **패키지 매니저**: Yarn<br/>
- **DB**: DynamoDB<br/>
- **배포**: AWS Lambda, API Gateway, S3, CloudFront(예정), DynamoDB<br/>
- **프레임워크**: Serverless Framework<br/><br/>
---

### 함수 관리
Serverless.yml을 사용하여 함수를 관리하며, 함수는 다음과 같이 구성됩니다(함수 추가할때마다 serverless.yml 파일에도 추가).
```yaml
functions:
  {functionName}:
    handler: {handlerPath}
    events:
      - http:
          path: {endpoint}
          method: {httpMethod}
          cors: {true/false}
```  
---
### Dynamo 쿼리 Config
'common/dynamodb' 디렉토리에 쿼리를 관리하며 각각의 기능을 유의하여야 합니다.
```typescript
// 단건 조회: 지정된 키로 단일 항목을 조회합니다.
export const getItem = async (params: GetItemCommandInput) => {
  ...
};

// 단건 삽입/생성: 지정된 데이터를 테이블에 단일 항목으로 삽입하거나 기존 항목을 덮어씁니다.
export const putItem = async (params: PutItemCommandInput) => {
    ...
}

// 단건 업데이트: 지정된 키로 단일 항목을 업데이트합니다.
export const updateItem = async (params: UpdateItemCommandInput) => {
    ...
};

// 단건 삭제: 지정된 키로 단일 항목을 삭제합니다.
export const deleteItem = async (params: DeleteItemCommandInput) => {
    ...
};

// 트랜잭션 처리: 여러 DynamoDB 항목을 원자적으로 읽고 쓰는 작업을 실행합니다.
export const executeTransactWrite = async (transactItems: TransactWriteItemsCommandInput) => {
    ...
};

// 조건 기반 다건 조회: 쿼리 조건에 맞는 항목을 조회합니다.
export const getQueryItem = async (params: QueryCommandInput) => {
    ...
};

// 다건 조회: 여러 테이블에서 항목을 일괄 조회합니다.
export const getBatchItem = async (params: BatchGetItemCommandInput): Promise<any> => {
    ...
};

```
