const baseDictionary = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~-';

export const shuffledIndicator = '_rhs';

const mod = (n, m) => ((n % m) + m) % m;

export class StrShuffler {
    constructor(dictionary) {
        this.dictionary = dictionary;
    }

    shuffle(str) {
        if (str.startsWith(shuffledIndicator)) {
            return str;
        }
        let shuffled = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charAt(i);
            const idx = baseDictionary.indexOf(char);
            if (char === '%' && str.length - i >= 3) {
                shuffled += char;
                shuffled += str.charAt(++i);
                shuffled += str.charAt(++i);
            } else if (idx === -1) {
                shuffled += char;
            } else {
                shuffled += this.dictionary.charAt(mod(idx + i, baseDictionary.length));
            }
        }
        return shuffledIndicator + shuffled;
    }

    unshuffle(str) {
        if (!str.startsWith(shuffledIndicator)) {
            return str;
        }
        const body = str.slice(shuffledIndicator.length);
        let unshuffled = '';
        for (let i = 0; i < body.length; i++) {
            const char = body.charAt(i);
            const idx = this.dictionary.indexOf(char);
            if (char === '%' && body.length - i >= 3) {
                unshuffled += char;
                unshuffled += body.charAt(++i);
                unshuffled += body.charAt(++i);
            } else if (idx === -1) {
                unshuffled += char;
            } else {
                unshuffled += baseDictionary.charAt(mod(idx - i, baseDictionary.length));
            }
        }
        return unshuffled;
    }
}
