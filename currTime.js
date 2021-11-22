export function getCurrTime() {
    let res = "";
    let data = new Date();
    let hh = data.getHours();
    let mm = data.getMinutes();
    let ss = data.getSeconds();

    if (hh < 10) {
        res += "0";
    }
    res += hh + ":";

    if (mm < 10) {
        res += "0";
    }
    res += mm + ":";

    if (ss < 10) {
        res += "0";
    }
    res += ss;
    return res;
}

export function getCurrDateTime() {
    let data = new Date();
    return (
        data.getFullYear() +
        "-" +
        (data.getMonth()) +
        "-" +
        data.getDate() +
        " " +
        data.getHours() +
        ":" +
        data.getMinutes() +
        ":" +
        data.getSeconds()
    );
}