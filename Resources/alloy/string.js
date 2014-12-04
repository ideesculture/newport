exports.trim = function(line) {
    return String(line).replace(/^\s\s*/, "").replace(/\s\s*$/, "");
};

exports.trimZeros = function(num) {
    var str = (num || "0") + "";
    if (-1 === str.indexOf(".")) return str;
    return str.replace(/\.?0*$/, "");
};

exports.ucfirst = function(text) {
    if (!text) return text;
    return text[0].toUpperCase() + text.substr(1);
};

exports.lcfirst = function(text) {
    if (!text) return text;
    return text[0].toLowerCase() + text.substr(1);
};

exports.formatCurrency = String.formatCurrency;

exports.urlDecode = function(string) {
    if (!string) return "";
    return string.replace(/%[a-fA-F0-9]{2}/gi, function(match) {
        return String.fromCharCode(parseInt(match.replace("%", ""), 16));
    });
};

exports.urlToJson = function(url) {
    var ret = {};
    var arr = url.split("?");
    var list = {};
    var queryarr = arr[1].split("&");
    for (var n = 0; queryarr.length > n; ++n) {
        var item = queryarr[n];
        if ("" === item) continue;
        var name, value, e = item.indexOf("=");
        if (0 > e) {
            name = item;
            value = null;
        } else {
            name = item.substring(0, e);
            value = item.substring(e + 1);
        }
        list[name] = value;
    }
    ret.url = arr[0];
    ret.query = list;
    return ret;
};