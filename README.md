# Node-Blog

개인 미니프로젝트

------

## 목차

1. 구현한 기능
2. API
3. 기술 리뷰



## 구현한 기능

로그인 & 회원가입

게시글 및 댓글 CRUD

새글 알람 (Socket.io)

파일 업로드


## API
<details>
<summary></summary>
 <div markdown="1">

| 기능                     | Method | URL                              | Request                                                      | Response                                                     |
| ------------------------ | ------ | -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 회원가입                 | POST   | /api/users                       | nickname,<br />email,<br />password,<br />confirmPassword    | 오류시 status(400)                                           |
|                          | GET    | /register                        |                                                              | 회원가입 페이지                                              |
| 로그인                   | POST   | /api/auth                        | email,<br />password                                         | token                                                        |
|                          | GET    | /                                |                                                              | 로그인 페이지                                                |
| 유저 인증                | GET    | /api/users/me                    | token                                                        |                                                              |
| Home 화면                | GET    | /api/blogs                       | category                                                     | blog_list                                                    |
| Home - 댓글 많은 순 정렬 | GET    | /api/blogs_sort_review           | category                                                     | blog_list                                                    |
|                          | GET    | /home                            |                                                              | 홈페이지                                                     |
| 상세페이지               | GET    | /api/blogs/:blogsId              | params                                                       | detail                                                       |
|                          | GET    | /detail                          |                                                              | 상세 페이지                                                  |
| 게시글 저장              | POST   | /api/save                        | name,<br />content,<br />token                               | names808 <br />- 닉네임<br />-  게시글번호<br />- 게시글 제목 |
|                          | GET    | /write                           |                                                              | 게시글 작성 페이지                                           |
| 게시글 수정              | POST   | /api/fix_save                    | goodsId,<br />name,<br />person,<br />content,<br />category |                                                              |
| 게시글 버튼 보이기       | POST   | /api/comment_fix_button/:blogsId | params, token                                                | "O"-인증성공<br />"X"-인증실패                               |
|                          | GET    | /fix                             |                                                              | 수정 페이지                                                  |
| 댓글 저장                | POST   | /api/comment_save/:blogsId       | params, comment                                              | names<br />- 닉네임<br />- 제목                              |
| 댓글 보여주기            | GET    | /api/comment/:blogsId            | params                                                       | comment_detail                                               |
| 댓글 삭제하기            | POST   | /api/delete_comment/:blogsId     | comment_Delete_Id,<br />nickname_check,<br />token           | "O" - 인증성공<br />"X" - 인증실패                           |
| 댓글 수정                | POST   | /api/show_fix_comments           | comment_Delete_Id, <br />nickname_check, <br />token         | comment_fix_receive - 인증 성공<br />"X" - 인증실패          |
| 댓글 수정 저장           | POST   | /api/save_fix_comments           | comment,<br />comment_Delete_ID,<br />nickname_check,<br />token | "O" - 인증성공<br />"X" - 인증실패       

</div>
</details>



기술 리뷰
<details>
<summary>여기를 눌러주세요</summary>
<div markdown="1">       

😎숨겨진 내용😎

</div>
</details>








