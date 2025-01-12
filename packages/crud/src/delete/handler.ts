import {TableName} from "../../../../commons/type/Types";
import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from "aws-lambda";
import {newApiResponse} from "../../../../commons/ApiProxy";
import {BoardItem} from "../../../../commons/item/BoardItem";
import {
  deleteBoardData, deleteCommentByBoardData,
  deleteCommentData, deleteUserData,
  getBoardDetailData,
  getCommentDetailData, getUserDetailData
} from "../../crudFunction";
import {CommentItem} from "../../../../commons/item/CommentItem";
import {UserItem} from "../../../../commons/item/UserItem";

const tableName: TableName = process.env.DYNAMODB_TABLE ?? '';

// 1. 게시글 삭제(게시글 삭제시 해당 댓글들 모두 삭제)
export const deleteBoard: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {boardSk} = JSON.parse(event.body ?? '{}');
  if (!boardSk) {
    return newApiResponse(400, "The 'boardSk' field required");
  }
  const boardItem: BoardItem = await getBoardDetailData(tableName, boardSk);

  if (!boardItem.PK) {
    return newApiResponse(404, "Board not found.")
  }

  await deleteBoardData(tableName, boardSk);
  await deleteCommentByBoardData(tableName, boardSk);

  return newApiResponse(200, "Board deleted successfully.")
};

// 2. 댓글 삭제
export const deleteComment: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {boardId, commentId} = JSON.parse(event.body ?? '{}');
  if (!boardId || !commentId) {
    return newApiResponse(400, "The 'boardId' or 'boardSk' field required");
  }
  const commentItem: CommentItem = await getCommentDetailData(tableName, boardId, commentId);

  if (!commentItem.PK) {
    return newApiResponse(404, "Comment not found.")
  }

  await deleteCommentData(tableName, commentItem.PK, commentItem.SK);
  return newApiResponse(200, "Comment deleted successfully.")
};

// 3. 유저 삭제 (TODO: 유저 삭제시 해당 게시글, 댓글 모두 삭제 할지 결정 해서 추가 구현 해야함)
export const deleteUser: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {userId} = JSON.parse(event.body ?? '{}');
  if (!userId) {
    return newApiResponse(400, "The 'userId' field required");
  }
  const userItem: UserItem = await getUserDetailData(tableName, userId);
  if (!userItem.PK) {
    return newApiResponse(404, "User not found.")
  }

  await deleteUserData(tableName, userItem.SK);
  return newApiResponse(200, "User deleted successfully")
}
