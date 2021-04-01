const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

// 이거 3번째에 모듈로 안 넣어줘도 적용되는거 물어보기
// (req, res, authmiddlewares) 이렇게 안 해도 되는 듯
module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    const [authType, authToken] = (authorization || "").split(" ");

    if (!authToken || authType !== "Bearer") {
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
        return;
    }
    try {
        const { userId } = jwt.verify(authToken, "my-key");
        User.findById(userId).then((user) => {
            res.locals.user = user;
            next();
        });
    } catch (err) {
        res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
    }
};