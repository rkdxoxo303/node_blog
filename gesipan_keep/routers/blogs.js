const express = require("express");
const Clogs = require("../schemas/blogs");
const User = require("../schemas/user");
const Comments = require("../schemas/comments");
const moment = require("moment");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");
const { response } = require('express');

const multer = require('multer')
const router = express.Router();
const upload = multer({ dest: 'public' })

const fs = require('fs');

const { Server } = require("http"); // 1. 모듈 불러오기
const socketIo = require("socket.io"); // 1. 모듈 불러오기

const app = express();
const http = Server(app); // 2. express app을 http 서버로 감싸기
const io = socketIo(http); // 3. http 객체를 Socket.io 모듈에 넘겨서 소켓 핸들러 생성



// api/upload   multer 이거 어쩌고 쓸떄, 밑에 file은 input-type:file의 네임값이 file
// router.post('/upload', upload.single('file'), (req, res) => {
//   console.log("하이하이")
//   console.log(req.file.filename)
//   res.send(req.file.filename)
// })

// api하위에 있었기 떄문에 api/goods 하면 이 함수가 호출됨
// 전체 내려 주는 것


// joi 사용
const postUsersSchema = Joi.object({
  nickname: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  confirmPassword: Joi.string().required(),
})

//회원가입
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

    const existUsers = await User.find({
      $or: [{ email }, { nickname }],
    });

    if (existUsers.length) {
      res.status(400).send({
        errorMessage: "이미 가입된 이메일 또는 닉네임이 있습니다.",
      });
      return;
    };

    const user = new User({ email, nickname, password: bcrypt.hashSync(password, 10), });

    // save는 저장하는 것
    await user.save();
    res.status(201).send({});

  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "양식을 맞춰주세용!",
    });
  };
});


// 로그인 joi 검사
const postAuthSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// 로그인
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

// 유저 인증
router.get("/users/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    user,
  });
  // 이거 user값을 전부다 넘기고 있는데
  // 왜 api/users/me로 가면 값이 안보이고
  // 로그인 하세요가 뜨나요?
  // 토큰이 사라지는 건가요?
});

// home화면에 게시글 보여주기 (최신순)
router.get("/blogs", async (req, res, next) => {
  try {
    // aa == bb // true false x 문법적인 문제만 넘어감
    const { category } = req.query;
    // goodsid 기준으로 정렬시켜서 가지고 온다.
    const blogs = await Clogs.find({ category }).sort("-goodsId");
    // json 형식으로 내려줄 것이다.
    res.json({ blog_list: blogs });
  } catch (err) {
    // ReferenceError: aa is not defined를 err값에 저장함
    // 보내는게 매개변수
    console.log('안녕 에러야')
    console.error(err);
    next(err);
  };
});
//

// home화면에 게시글 보여주기 (댓글많은순)
router.get("/blogs_sort_review", async (req, res, next) => {
  try {
    // aa == bb // true false x 문법적인 문제만 넘어감
    // goodsid 기준으로 정렬시켜서 가지고 온다.
    const blogs = await Clogs.find({}).sort("-comment_count");
    // json 형식으로 내려줄 것이다.
    res.json({ blog_list: blogs });
  } catch (err) {
    // ReferenceError: aa is not defined를 err값에 저장함
    // 보내는게 매개변수
    console.log('안녕 에러야')
    console.error(err);
    next(err);
  };
});
//

// 상세페이지 보여주기
router.get("/blogs/:blogsId", async (req, res) => {
  // 여기 변수로 들어오는 것;
  // const { blogsId } = req.parms
  const { blogsId } = req.params

  // 해당 Goods id에 해당하는 goods아이디에 속한 finde one 하나만 가지고 옴
  blogs = await Clogs.findOne({ goodsId: blogsId });

  // detail이란 키 안에 goods 를 받아서 내려줌
  // 클라이언트가 받겠군ㅋ
  res.json({ detail: blogs });
});

// 게시글을 저장한다.
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

// 게시글 수정하기 updateOne
router.post("/fix_save", async (req, res) => {
  const { goodsId, name, person, content, category } = req.body
  // set 뭐지?
  await Clogs.updateOne({ goodsId }, { $set: { name, person, content, category } });
});

// 게시글 삭제하기
router.post("/fix_delete", async (req, res) => {
  const blogsId = req.body['goodsId']
  // blogsId :: goodsId
  // deleteone은 set을 안씀

  const delete1 = await Clogs.findOne({ goodsId: blogsId })
  const delete_picture = delete1["file_name"]
  console.log(delete_picture)
  fs.unlink(`public/${delete_picture}`, (err) => {
  }
  )
  await Clogs.deleteOne({ goodsId: blogsId })
})

// 개시글 수정 버튼 보이기
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

// 댓글 보여주기
router.get("/comment/:blogsId", async (req, res) => {
  const { blogsId } = req.params
  comment_Id = await Comments.find({ commentId: blogsId }).sort("-comment_Delete_Id");

  res.json({ comment_detail: comment_Id });
});

// 댓글 삭제하기
router.post("/delete_comment/:blogsId", async (req, res) => {

  const comment_Delete_Id = req.body.comment_Delete_Id;
  const token = req.body.token;
  const nickname_check = req.body.nickname_check;

  payload = jwt.verify(token, "my-key");
  const { nickname } = await User.findOne({ _id: payload.userId });
  if (nickname_check == nickname) {
    await Comments.deleteOne({ comment_Delete_Id: comment_Delete_Id })

    const { blogsId } = req.params
    const goodsId = blogsId

    let count = await Clogs.findOne({ goodsId: blogsId })
    let comment_count = count['comment_count'] - 1
    await Clogs.updateOne({ goodsId }, { $set: { comment_count } })
    res.send("O")
  } else {
    res.send("X")
  }

  // 댓글수 카운터 감소 시키기
});

// 댓글 수정하기 시작
router.post("/show_fix_comments", async (req, res) => {
  const comment_Delete_Id = req.body.comment_Delete_Id;
  const nickname_check = req.body.nickname_check;
  const token = req.body.token;

  payload = jwt.verify(token, "my-key");
  const { nickname } = await User.findOne({ _id: payload.userId });

  if (nickname_check == nickname) {
    let comment_give = await Comments.findOne({ comment_Delete_Id });
    console.log(2)
    console.log(comment_give)
    res.json({ comment_fix_receive: comment_give });
  } else {
    res.send("X")
  }
})

// 댓글 수정한 것 저장하기
router.post("/save_fix_comments", async (req, res) => {

  const comment = req.body.comment;
  const comment_Delete_Id = req.body.comment_Delete_Id;
  const nickname_check = req.body.nickname_check;
  const token = req.body.token;

  console.log(comment)

  payload = jwt.verify(token, "my-key");
  const { nickname } = await User.findOne({ _id: payload.userId });

  if (nickname_check == nickname) {
    await Comments.updateOne({ comment_Delete_Id }, { $set: { comment } });
    res.send("O")
  } else {
    res.send("X")
  }
})


module.exports = router;