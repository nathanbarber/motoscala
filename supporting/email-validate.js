module.exports = function (username, token) {    
    return `<!DOCTYPE HTML>
        <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', 'Avenir', Tahoma, Geneva, Verdana, sans-serif;
                        text-align: center;
                    }
                    .image-container {
                        width: 100%;
                        position: relative;
                        margin-top: 30px;
                        text-align: center;
                    }
                    img {
                        width: 30%;
                    }
                    .header {
                        margin-top: 40px;
                        width: 100%;
                        font-size: 30px;
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
                        cursor: pointer;
                        user-select: none;
                    }
                    .button:hover {
                        background-color: rgb(235, 122, 122);
                    }
                </style>
                <script>
                    function redirect() {
                        window.location.href = "http://localhost:8080/validate-email?username=" + "${username}" + "&token=" + "${token}";
                    }
                </script>
            </head>
            <body>
                <div class="image-container"><img src="http://localhost:8080/lib/icon.png"></div>
                <div class="header">Click below to validate your email.</div>
                <span class="button" onclick="redirect()">Confirm</span>
            </body>
        </html>`
}