/**
 * Comment Model
 * Repräsentiert einen Kommentar zu einem Ticket
 */
export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Comment mit Author-Details für Frontend
 */
export interface CommentWithAuthor extends Comment {
  author?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
}
