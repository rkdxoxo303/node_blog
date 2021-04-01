const mongoose = require("mongoose");
const { Schema } = mongoose;
const blogsSchema = new Schema({
    goodsId: {
        type: Number,
        required: true,
        unique: true
    },
    nickname: {
        type: String,
    },
    // required를 쓰게되면 중복되지 않은 것만 쓸 수 있음
    name: {
        type: String,
        // required: true,
        // unique: true
    },
    content: {
        type: String,
    },
    category: {
        type: String
    },
    day: {
        type: String
    },
    file_name: {
        type: String
    },
    comment_count: {
        type: Number,
    },
});

// 몽고db값이 대문자라도 여기선 소문자로 써야할 듯.
// 몽고db값 대문자인식 못함
module.exports = mongoose.model("blogs", blogsSchema);


// 지윤님
// const Blog = model("blog", BlogSchema);
// module.exports = { Blog };