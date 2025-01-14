import {NullableString} from "../type/Types";

export interface FileItem {
  PK: string;
  SK: string;
  fileName: string;
  path: string;
  memo: NullableString;
  createdAt: number;
}
