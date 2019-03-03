module.exports = function (username, token) {    
    return `<!DOCTYPE HTML>
        <html>
            <head>
                <style>
                    div, span {
                        font-family: 'Segoe UI', 'Avenir', Tahoma, Geneva, Verdana, sans-serif;
                        text-align: center;
                    }
                    .header {
                        margin-top: 40px;
                        width: 100%;
                        font-size: 20px;
                        color: #676767;
                        padding-bottom: 30px;
                    }
                    .button-container {
                        width: 100%;
                        position: relative;
                        text-align: center;
                    }
                    .button {
                        padding: 10px;
                        padding-top: 5px;
                        padding-bottom: 5px;
                        margin-top: 45px;
                        background-color: #DD6666;
                        border-radius: 5px;
                        color: white;
                        box-shadow: 0px 10px 10px #efefef;
                        transition: all 150ms ease-in;
                        font-size: 16px;
                        cursor: pointer;
                        user-select: none;
                        margin-bottom: 60px;
                    }
                    .button:hover {
                        background-color: rgb(235, 122, 122);
                    }
                    a {
                        text-decoration: none;
                        color: #efefef;
                    }
                </style>
            </head>
            <body>
                <div class="header">Click below to validate your email.</div>
                <div class="button-container"><a class="button" href="http://localhost:8080/validate-email?username=${username}&token=${token}">Confirm</a></div>
                <br>
            </body>
        </html>`
}