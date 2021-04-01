const express = require('express');
const moment = require("moment");
const mongoose = require("mongoose");
const connect = require('./schemas');
const Joi = require("joi");

const { Server } = require("http"); // 1. 모듈 불러오기
const socketIo = require("socket.io"); // 1. 모듈 불러오기

connect(); //기본적으로 몽고디비랑 연결을 해준다.

const app = express();
const http = Server(app); // 2. express app을 http 서버로 감싸기
const io = socketIo(http); // 3. http 객체를 Socket.io 모듈에 넘겨서 소켓 핸들러 생성


app.use(express.json())

// url을 타고 들어오니까 incode? express는 인코더해서 컴퓨터가 알아들을 수 있는 언어로 변환해서 받아옴 //
app.use(express.urlencoded({ extended: false }))

const blogsRouter = require("./routers/blogs");
app.use("/api", [blogsRouter]);

io.on("connection", (sock) => {
    // sock.emit("BUY_GOODS", {
    //     nickname: "닉네임",
    //     goodsId: 10, // 서버가 보내준 상품 데이터 고유 ID
    //     goodsName: "게시2글",
    //     date: "날짜",
    // });

    sock.on("SAVE", (data) => {
        const emitData = {
            ...data,
            date: moment().format("YYYY년 MM월 DD일 HH:mm")
        };
        io.emit("SAVE_REVIEW", emitData);
    });
});

// 이미지 파일 /이미지.png 이렇게하면 바로 사용가능
app.use(express.static('public'));


// 먼진 모르지만 express 쓸 때 쓰는건가 봄
app.use(express.urlencoded({ extended: false }))


// views 폴더랑 연결해주기 // ejs 모듈
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


// 로그인 페이지 이동
app.get('/', (req, res) => {
    res.render('login')
})

// 로그인 페이지 이동
app.get('/register', (req, res) => {
    res.render('register')
})


// /home 하면 index.ejs로 감
app.get('/home', (req, res) => {
    res.render('index')
})

// /게시글 작성 페이지 이동하기
app.get('/write', (req, res) => {
    res.render('write')
})

app.get('/detail', (req, res) => {
    res.render('detail')
})

app.get('/fix', (req, res) => {
    res.render('fix')
})

// ReferenceError: aa is not defined를 err값에 저장함
app.use((err, req, res, next) => {
    console.log("에러야에러야")
    res.send('에러 났지롱, 근데 안 알려주지롱!')
})

// 5. app 대신 http 객체로 서버 열기
http.listen(3000, () => {
    console.log("서버가 요청을 받을 준비가 됐어요");
});