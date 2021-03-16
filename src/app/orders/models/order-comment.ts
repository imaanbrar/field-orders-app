import { dxDataGridRowObject } from "devextreme/ui/data_grid";
import Comment = OrderComment.Comment;
import Note = OrderComment.Note;

export {
  OrderComment,
};

class OrderComment {

  id: number;
  orderId: number;

  comment: string;
  commentDate?: string | Date;

  createdBy?: number;
  createdDate?: string | Date;
  modifiedBy?: number;
  modifiedDate?: string | Date;

  constructor(comment: Note | Comment | dxDataGridRowObject) {
  }
}

declare namespace OrderComment {

  interface Comment {
    id: number;
    orderId: number;
    comment: string;
    commentDate?: string | Date;
    createdBy?: number;
    createdDate?: string | Date;
    modifiedBy?: number;
    modifiedDate?: string | Date;
  }

  interface Note {
    "Note/ Comment": string;
    Date: number;
  }
}
