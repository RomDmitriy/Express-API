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

export function getUTCCurrTime() {
    let res = "";
    let data = new Date();
    let hh = data.getUTCHours();
    let mm = data.getUTCMinutes();
    let ss = data.getUTCSeconds();

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
        (data.getMonth() + 1) +
        "-" +
        data.getDate() +
        " " +
        getCurrTime()
    );
}

export function getCurrDateTimeUTC() {
    let data = new Date();
    return (
        data.getUTCFullYear() +
        "-" +
        (data.getUTCMonth() + 1) +
        "-" +
        data.getUTCDate() +
        " " +
        getUTCCurrTime()
    );
}