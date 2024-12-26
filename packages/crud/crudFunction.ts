import {TableName} from "../../commons/type/Types";
import {BoardItem} from "../../commons/item/BoardItem";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {getQueryItem} from "../../commons/dynamo/dynamoCommands";
import {Constants} from "../../Constants";


export const getBoardListData = async (tableName: TableName): Promise<Array<BoardItem>> => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: marshall({
      ":pk": Constants.BOARD
    }, { removeUndefinedValues: true })  // 옵션 추가
  }
  const result = await getQueryItem(params);
  return result.Items ? result.Items.map(item => unmarshall(item) as BoardItem) : [];
}
