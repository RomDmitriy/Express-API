import app from "./app.js";

app.listen(5000, () =>
    console.log(
        new Date().getUTCHours() +
            3 +
            ":" +
            new Date().getUTCMinutes() +
            ":" +
            new Date().getUTCSeconds() +
            " - API v4.0-alpha started working!"
    )
);
