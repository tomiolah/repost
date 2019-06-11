# USER ✅
  ```js
  {
    username: String,
    password: String,
  }
  ```

  - Get All - `GET /api/users` (+ rating) ✅
  - Get By Username - `GET /api/users/{username}` (+ rating) ✅
  - Create - `POST /api/users` ✅
    ```js
      {
        username: String,
        password: String,
      }
    ```
  - Remove - `DELETE /api/users/{username}` ✅
    - Delete Posts and Comments associated + remove from SRs

# SUBREPOST ✅
  ```js
  {
    name: String,
    description: String,
    mod_count: Number,
    users: [
      {
        username: String,
        moderator: Boolean,
      }
    ],
  }
  ```

  - Get All - `GET /api/subreposts` ✅
  - Get By Name - `GET /api/subreposts/{subrepost}` ✅
  - Get By User - `GET /api/subreposts?username={username}` ✅
  - Create - `POST /api/subreposts` ✅
  - Delete - `DELETE /api/subreposts/{subrepost}` ✅
  - Add Mod / Upgrade User - `PATCH /api/subreposts/{subrepost}` ✅
    ```js
      {
        username: String,
        moderator: true,
      }
    ```
  - Remove Mod / Add User - `PATCH /api/subreposts/{subrepost}` ✅
    ```js
      {
        username: String,
        moderator: false,
      }
      // If last mod, DELETE SR
    ```
  - Remove User / Mod (BAN) - `PATCH /api/subreposts/{subrepost}` ✅
    ```js
      {
        username: String,
        remove: true,
      }
      // If last mod, DELETE SR
    ```

# POST ✅
  ```js
    {
      _id: ObjectID,
      subrepost: String,
      username: String,
      content: String,
      posted: Date,
      rating: Number,
    }
  ```

  - Get All - `GET /api/posts` ✅
  - Get By ID - `GET /api/posts/{postID}` ✅
  - Get By SR - `GET /api/posts?subrepost={subrepost}` ✅
  - Get By User - `GET /api/posts?username={username}` ✅
  - Create - `POST /api/posts` ✅
    ```js
      {
        subrepost: String,
        username: String,
        content: String,
      }
    ```
  - Up / Downvote - `PATCH /api/posts/{postID}` ✅
    ```js
      {
        rating: 1 | -1,
      }
    ```
  - Remove By ID - `DELETE /api/posts/{postID}` ✅
    - Delete all comments ✅
  - Remove By SR - `DELETE /api/posts?subrepost={subrepost}` ✅
  - Remove By User - `DELETE /api/posts?username={username}` ✅

# COMMENT ✅
  ```js
    {
      username: String,
      posted: Date,
      content: String,
      rating: Number,
      post: ObjectID,
      parent: ObjectID | undefined,
    }
  ```

  - Get All - `GET /api/comments` ✅
  - Get By ID - `GET /api/comments/{commentID}` ✅
  - Get By User - `GET /api/comments?username={username}` ✅
  - Get By Post - `GET /api/comments?postID={postID}` ✅
  - Get By Parent - `GET /api/comments?parent={parentID}` ✅
  - Create - `POST /api/comments` ✅
    ```js
      {
        username: String,
        content: String,
        parentID: ObjectID | undefined,
        postID: ObjectID, // Optional if parent defined
      }
    ```
  - Up / Downvote - `PATCH /api/comments/{commentID}` ✅
    ```js
      {
        rating: 1 | -1,
      }
    ```
  - Remove By ID - `DELETE /api/comments/{commentID}` ✅
  - Remove By Post -  `DELETE /api/comments?post={postID}` ✅