import {NullableString, SK, TableName} from "../../commons/type/Types";
import {FileItem} from "../../commons/item/FileItem";
import {Constants} from "../../commons/Constants";
import {newFileSK} from "../../commons/utils/CommonUtils";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {getItem} from "../../commons/dynamo/dynamoCommands";

export interface uploadFileRequest {
  fileName: string;
  file: any;
  memo: NullableString;
  createdAt: number;
}

export interface downloadFileRequest {
  fileId: SK;
}

export const toFileUploadRequest = (event: uploadFileRequest): FileItem => {
  return {
    PK: Constants.FILE,
    SK: newFileSK(),
    path: "/" + event.createdAt,
    fileName: event.fileName,
    memo: event.memo,
    createdAt: event.createdAt
  };
}

export const getFileDetailData = async (tableName: TableName, fileId: SK): Promise<FileItem> => {
  const params = {
    TableName: tableName,
    Key: marshall({
      PK: {S: Constants.FILE},
      SK: {S: fileId}
    }, {removeUndefinedValues: true})
  }
  const result = await getItem(params);
  return result.Item ? unmarshall(result.Item) as FileItem : Constants.EMPTY_FILE_ITEM;
}
