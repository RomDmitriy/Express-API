import app from "./shared/app.js";
import { getCurrTime } from "./shared/times.js";

console.log("API v6.0.3 Final");

const port = process.env.PORT || 5000;

console.log("Port: " + port);

app.listen(port, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);
