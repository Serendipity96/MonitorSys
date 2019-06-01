function formatLevel(str) {
    switch (str) {
        case 'urgent':
            return '紧急'
        case 'normal':
            return '普通'
    }
}

module.exports = formatLevel;