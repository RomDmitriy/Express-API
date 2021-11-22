import app from "./app.js";
import { getCurrTime } from "./currTime.js";

console.log("API v" + process.env.npm_package_version);

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);
