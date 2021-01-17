class PTResponse {
    constructor(resultCode, resultMessage, resultData) {
        this.resultCode = resultCode;
        this.resultMessage = resultMessage;
        this.resultData = resultData;
    }
}

module.exports = PTResponse;