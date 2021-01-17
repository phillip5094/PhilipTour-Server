class PTUser {
    constructor(idx, username, userid, userpw, regdate) {
        this.idx = idx;
        this.username = username;
        this.userid = userid;
        this.userpw = userpw;
        this.regdate = regdate;
    }
}

module.exports = PTUser;