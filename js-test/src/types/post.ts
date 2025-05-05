export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
}

export interface DetailedPost extends Post {
  user?: {
    id: number;
    username: string;
    fullName: string;
  };
  comments: Comment[];
}

export type PostWithComments = {
  post: Post;
  comments: Comment[];
};

export interface Comment {
  id: number;
  body: string;
  postId: number;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
}
