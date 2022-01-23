export function sleep(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cutStrToMax(str, maxLength) {
   return str.length <= maxLength ? str : str.substr(0, maxLength);
}
