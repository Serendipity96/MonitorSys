function formatTime(timeStamp) {
    let timeTrans = new Date(parseInt(timeStamp * 1000));
    return timeTrans.toLocaleString('chinese', {hour12: false})
}

module.exports = formatTime;

