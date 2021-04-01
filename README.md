# Node-Blog

개인 미니 프로젝트

---

# **구현한 기능**

로그인, 게시글 및 댓글 CRUD, 새 글 알람(Socket.IO), 파일 업로드

API설계

| 기능 | Method    | URL | request | response |
| :-       | -    | :-: | -:      | -:       |
| 메인페이지  | GET | / |  | 메인 페이지 |
|          | GET | /api/list |  | 게시글 목록(제목, 작성자, 작성일) |
| 글쓰기     | GET | /post | | 게시글 작성 페이지 |
|          | POST | /api/post | {title, write, password, content} | 게시글 작성 처리 후 성공 여부 |
| 상세 페이지 | GET | /detail/:id |  | 게시글 상세 페이지 |
|          | GET | /api/detail/:id |  | 해당 글 데이터(제목, 작성자, 작성일, 내용) |
| 수정 페이지 | GET | /update/:id |  | 게시글 수정 페이지 |
|          | GET | /api/update/:id |  | 수정을 위한 글 정보(제목, 작성자, 내용) |
|          | PUT | /api/update/:id | { password } | 패스워드 확인 후 수정 |
|          | DELETE | /api/delete/:id | { password } | 패스워드 확인 후 삭제 |

ㄴㅇㄴㅇㄴㅇㄴㅇ