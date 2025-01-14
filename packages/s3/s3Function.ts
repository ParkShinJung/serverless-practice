import {NullableString} from "../../commons/type/Types";
import {FileItem} from "../../commons/item/FileItem";
import {Constants} from "../../commons/Constants";
import {newFileSK} from "../../commons/utils/CommonUtils";

export interface uploadFileRequest {
  fileName: string;
  file: any;
  memo: NullableString;
  createdAt: number;
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
