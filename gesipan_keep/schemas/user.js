const mongoose = require("mongoose");

mongoose.connection.on("error", err => {
    console.error("몽고디비 연결 에러", err);
});

const UserSchema = new mongoose.Schema({
    email: String,
    nickname: String,
    password: String,
});

// 아 이부분이 _id를 useriD로 뭔가 바꿔주는 구나 아하
UserSchema.virtual("userId").get(function () {
    return this._id.toHexString();
});

UserSchema.set("toJSON", {
    virtuals: true,
})

module.exports = mongoose.model("user", UserSchema)
                             // bbb 아 여기가 db구나! 무조건 s가 붙는다. //