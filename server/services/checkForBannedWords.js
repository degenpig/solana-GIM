const bannedWords  = require("./words.js");

const checkForBannedWords = (message) => {
    var words = message.split(' ');

    var foundBadWords = words.filter(el => bannedWords.words.includes(el));

    if(foundBadWords.length > 0) return true;

    return false;
};

exports.checkForBannedWords = checkForBannedWords;