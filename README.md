# Node-Blog
개인 미니프로젝트

http://3.35.175.76/home

배포 :: 서버는 AWS EC2 와 FileZilla 이용, 배포는 PM2로 배포

![image](https://user-images.githubusercontent.com/78591345/113245864-c9c7fd80-92f2-11eb-8e8d-602bac970330.PNG)

------

## 목차

1. 구현한 기능
2. API
3. 코드 셀프 리뷰



## 구현한 기능

로그인 & 회원가입

게시글 및 댓글 CRUD

새글 알람 (Socket.io)

파일 업로드



## API
<details> <summary> </summary> <div markdown="1">     


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
| 댓글 수정 저장           | POST   | /api/save_fix_comments           | comment,<br />comment_Delete_ID,<br />nickname_check,<br />token | "O" - 인증성공<br />"X" - 인증실패                           |
| 실시간 알림              |        | "SAVE"                           | nickname,<br />goodsId,<br />goodsName                       | 'SAVE_REVIEW'                                                |
|                          |        | "SAVE_REVIEW"                    |                                                              | nicakname,<br />goodsId,<br />goodsName,<br />date<br />     |

</div>
</details>


## 코드 셀프 리뷰

<details>
<summary>로그인 & 회원가입&유저인증
</summary>
<div markdown="1">       

![image](https://user-images.githubusercontent.com/78591345/113245869-ca609400-92f2-11eb-8102-97625622c541.PNG)
![image](https://user-images.githubusercontent.com/78591345/113245870-caf92a80-92f2-11eb-802f-c281cd95d1c7.PNG)


```js
const postUsersSchema = Joi.object({
  nickname: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  confirmPassword: Joi.string().required(),
})
```

joi를 사용하여, 스트링에 제약을 두었다.

```js
router.post("/users", async (req, res) => {
  try {
    const { nickname, email, password, confirmPassword } = await postUsersSchema.validateAsync(req.body);
    console.log(nickname)
    if (password !== confirmPassword) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
      });
      return;
    }
        if (password.indexOf(nickname) != -1) {
      res.status(400).send({
        errorMessage: "패스워드에 아이디값이 들어가있습니다.",
      });
      return;
    }
```

회원가입은 클라이언트에서 정보를 받아온 후 비밀번호와 비밀번호 확인이 일치하면 통과하고, 아니면 에러 메시지를 보냈다. 패스워드에 아이디값이 들어있는 것, 양식 문제 등 모두  if로 설정했다.

```js
router.post("/auth", async (req, res) => {
  try {
    const { email, password } = await postAuthSchema.validateAsync(req.body);
    const user = await User.findOne({ email }).exec();

    bcrypt.compare(password, user["password"], (err, same) => { // 비밀번호 일치 확인
      if (same) {
        const token = jwt.sign({ userId: user.userId }, "my-key");
        res.send({
          token,
        });
      } else {
        res.status(400).send({
          errorMessage: "이메일 또는 패스워드가 잘못됐습니다.",
        });
        return;
      }
    })
  } catch (err) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드의 형식이 올바르지 않습니다."
    });
  }
});
```

로그인에 성공하면 jwt토큰을 주고, 비밀번호는 bcrypt를 이용하여 암호화해서 DB에 넣었다.

```js
router.get("/users/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    user,
  });
});
```

유저 인증은 authMiddleware를 거쳐, 통과하면 authMiddleware에서 next()로 넘어오고, 실패하면 에러를 반환하게 해뒀다.

method : get

url : api/users/me

이 부분을 유저인증이 필요할 때마다 사용하였다.

</div>
</details>



<details>
<summary>게시글 수정 버튼 보이기 / 안 보이기</summary>
<div markdown="1"> 
  
![image](https://user-images.githubusercontent.com/78591345/113245861-c896d080-92f2-11eb-8b75-02c4cd128e6d.PNG)
![image](https://user-images.githubusercontent.com/78591345/113245863-c92f6700-92f2-11eb-9e67-b279fe00733c.PNG)

```js
router.post("/comment_fix_button/:blogsId", async (req, res) => {

  const { blogsId } = req.params;
  const token = req.body.token;
  payload = jwt.verify(token, "my-key");
  const { nickname } = await User.findOne({ _id: payload.userId });

  const cur_board = await Clogs.findOne({ goodsId: blogsId })

  if (cur_board['nickname'] == nickname) {
    res.send("O");
  } else {
    res.send("X")
  }
});
```

더 좋은 방법이 있겠지만, 생각이 안났다.

1. 클라이언트에서 토큰을 받아온다.

2. 토큰을 verify하면 userId의 원본이 나오기 때문에, 그걸 이용하여 DB의 nickname값을 추출한다
3. 만약 blogs의 db에 저장된 닉네임 값과 토큰을 verify한 닉네임값이 동일하면 O를 아니면 X를 보낸다.
4. 클라이언트에서 O를 응답받으면 display:block, X를 받으면 display:none;을 처리한다.

</div>
</details>


<details>
<summary>댓글</summary>
<div markdown="1">    
  
  ![image](https://user-images.githubusercontent.com/78591345/113245854-c765a380-92f2-11eb-9dc9-adc47c36a6e1.PNG)
  ![image](https://user-images.githubusercontent.com/78591345/113245859-c7fe3a00-92f2-11eb-800c-f0cdfb9ebdd6.PNG)

```js
// 댓글을 저장한다.
router.post("/comment_save/:blogsId", async (req, res, next) => {

  const { blogsId } = req.params
  const goodsId = blogsId
  const comment = req.body.comment;

  // 닉네임 빼오기
  const token = req.body.token;

  payload = jwt.verify(token, "my-key");
  const { nickname } = await User.findOne({ _id: payload.userId });

  let comment_Delete_Id = 0

  let data = await Comments.find({}).sort("-comment_Delete_Id")

  if (data.length == 0) { comment_Delete_Id = 1 }
  else { comment_Delete_Id = data[0]["comment_Delete_Id"] + 1 }

  // 댓글수 카운터 증가 시키기
  let count = await Clogs.findOne({ goodsId: blogsId })
  let comment_count = count['comment_count'] + 1
  await Clogs.updateOne({ goodsId }, { $set: { comment_count } })

  await Comments.create({
    comment,
    nickname,
    comment_Delete_Id,
    commentId: blogsId
  })

  const name = await Clogs.findOne({ goodsId: goodsId });
  const board_name = name["name"]
  const names = [nickname, board_name]
  res.send(names)
})
```

댓글 카운터 부분은 db를 하나 더써서, comment DB가아니라, 기존 Blog DB를 이용하여 카운터를 저장했다.

댓글을 남길 때마다 다른 DB의 값을 +1 해주고,

댓글을 삭제할 때마다 -1 해줬다.

이렇게 DB를 2~3개 동시에 이용해보는데, 하나로만 이용하는 좋은 방법이 없을까 고민하게 됐다.

</div>
</details>


<details>
<summary>댓글 & 새글 실시간 알람</summary>
<div markdown="1">   
  
 ![image](https://user-images.githubusercontent.com/78591345/113246383-e7e22d80-92f3-11eb-93cd-f30b20bf1be2.PNG)
 ![image](https://user-images.githubusercontent.com/78591345/113246385-e87ac400-92f3-11eb-8813-5ddc2fcee2a5.PNG)
 
 - 접속해있는 모든 사람에게 알람이 가며, 글을 선택하면 해당 페이지로 이동한다.


서버쪽

```js
io.on("connection", (sock) => {

    sock.on("SAVE", (data) => {
        const emitData = {
            ...data,
            date: moment().format("YYYY년 MM월 DD일 HH:mm")
        };
        io.emit("SAVE_REVIEW", emitData);
    });
});
```

클라이언트쪽

```js
        const socket = io.connect('/')

        socket.on('SAVE_REVIEW', function (data) {
            const { nickname, goodsId, goodsName, date } = data
            makeBuyNotification(nickname, goodsName, goodsId, date)
        })

        function postOrder(nickname, boardname) {
            socket.emit('SAVE', {
                nickname: nickname,
                goodsId: blogsId,
                goodsName: boardname
            })
        }
        function makeBuyNotification(targetNickname, goodsName, goodsId, date) {
            const messageHtml = `<span style="color:hotpink; font-family: 'Stylish', sans-serif;">${targetNickname}</span>
            <span style="font-family: 'Stylish', sans-serif;">님이 방금 <a href="/detail?goodsId=${goodsId}" class="alert-link">${goodsName}</a>에 새로운 글을 남겼어요! <br /><small>(${date})</small>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>`
            const alt = $('#customerAlert')
            if (alt.length) {
                alt.html(messageHtml)
            } else {
                const htmlTemp = `<div class="alert alert-sparta alert-dismissible show fade" role="alert" id="customerAlert">${messageHtml}</div>`
                $('#top_alert').append(htmlTemp)
            }
        }
```

1. 클라이언트에서 postOrder 함수가 발동되면, 'SAVE'란 이름으로 socket을 emit한다.

2. 서버는 SAVE에서 nickname, goodsId, goodsname의 변수를 받는다.
3. 받은 변수에서, date에 moment를 이용한 시간 표현만 추가하여 "SAVE_REVIEW"로 내보낸다.
4. 클라이언트에서 "SAVE_REVIEW"를 받고, 받아온 변수를 makeBuyNotification 함수에 인자로 넣고 발동시킨다.


</div>
</details>


<details>
<summary>게시글 저장 & 파일 업로드</summary>
<div markdown="1">       

![image](https://user-images.githubusercontent.com/78591345/113246485-1233eb00-92f4-11eb-8f6e-1d3e1c86c292.PNG)

```js
router.post("/save", upload.single('file'), async (req, res, next) => {

  let file_name = ""
  try {
    file_name = req.file.filename
  } catch {
    file_name = "https://t1.daumcdn.net/cfile/blog/18488D4C4D9377DB08"
  }

  try {
    const name = req.body.name;
    const content = req.body.content;
    const { token } = req.headers;

    payload = jwt.verify(token, "my-key");
    const { nickname } = await User.findOne({ _id: payload.userId })

    let goodsId = 0
    let data = await Clogs.find({}).sort("-goodsId")

    if (data.length == 0) { goodsId = 90 }
    else { goodsId = data[0]["goodsId"] + 1 }
    //  if (isExist.length == 0)

    let comment_count = 0

    await Clogs.create({
      goodsId,
      name,
      content,
      nickname,
      comment_count,
      file_name,
      day: moment().format("YYYY년 MM월 DD일 HH:mm")
    }),
      names808 = [nickname, goodsId, name]

    res.send(names808)
  } catch (err) {
    next(err);
  }
});
```

업로드엔 multer 모듈을 사용했다.

제대로 배우지 않고 일단 해본거라 어딘가 문제가 있을 수도 있다.

1. 클라이언트에서 file을 보낸걸 multer의 upload.single 미들웨어를 이용하여 서버에 저장한다.
2. 만약 클라이언트가 보낸 사진이 없다면, catch를 사용하여 file_name을 꽃 사진으로 바꾼다.
3. 클라이언트가 보내 온 name, content, token을 이용하여 기본적으로 저장할 변수를 정한다.
4. Clogs라고 저장해둔 몽고db스키마를 이용하여 값을 저장한다.
5. 여기서 file_name은 이름값만 저장해둔다. (추후에 상세 페이지에 그 이름을 따와서 뿌려줄거기 때문에 이름값이 필요할 거라 생각했다.)
6. 실시간 알람을 해줘야하기 때문에, 그 정보를 받아갈 names808을 정해두고, 클라이언트에 뿌려줬다.

</div>
</details>


<details>
<summary>DB설계</summary>
<div markdown="1">  

몽고DB를 사용했다.

![image](https://user-images.githubusercontent.com/78591345/113245860-c896d080-92f2-11eb-9ecf-2b78917b5ce1.PNG)

blogs

- goodsId : 고유값을 이용할 때 사용했다. comment의 commenId와 일치한다.

- name : 게시글 제목
- content : 게시글 내용
- nickname : 작성자 닉네임
- comment_count : 각 게시글의 댓글 수를 카운팅 해준다.
- file_name : 상세페이지에 사진을 뿌려주기 위해, 저장된 사진 이름
- day : 게시글 작성한 날짜



comment

- comment : 댓글 내용
- nickname : 작성자 이름
- comment_Delete_Id : 댓글 삭제등등 할 때 필요한 댓글 고유값
- commentId : 댓글이 어느 게시글에 있는지 확인하는데 쓰임 (쿼리스트링값이랑 동일)



users

- email : 로그인 할 때 쓰이는 이메일
- nickname : 글 작성, 댓글 등에 보이는 닉네임
- password : 비밀번호

</div>
</details>
