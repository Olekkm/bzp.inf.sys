export class RusABC {
    ABC
    minKey
    maxKey

    constructor() {
        this.ABC = {
            1: "А", 9: "И", 17: "Р", 25: "Ш",
            2: "Б", 10: "Й", 18: "С", 26: "Щ",
            3: "В", 11: "К", 19: "Т", 27: "Ы",
            4: "Г", 12: "Л", 20: "У", 28: "Ь",
            5: "Д", 13: "М", 21: "Ф", 29: "Э",
            6: "Е", 14: "Н", 22: "Х", 30: "Ю",
            7: "Ж", 15: "О", 23: "Ц", 31: "Я",
            8: "З", 16: "П", 24: "Ч", 32: "_",
        }

        this.minKey = 1
        this.maxKey = 32
    }

    getSymbol(key) {
        if (!Number.isInteger(key)) {
            throw new TypeError("key argument must be an integer")
        }

        if (key < this.minKey || key > this.maxKey) {
            throw new RangeError("key is out of range")
        }

        return this.ABC[key]
    }


    //currently not working
    getKey(RusABCsymbol) {
        const keys = Object.values(this.ABC)
        console.log(keys)

        return keys.find(key => object[key] === RusABCsymbol)
    }

    getCodeFromKey(key) {
        if (!Number.isInteger(key)) {
            throw new TypeError("key argument must be an integer")
        }

        if (key < this.minKey || key > this.maxKey) {
            throw new RangeError("key is out of range")
        }

        if (key === 32) { return "00000" }


        const bin = key.toString(2)
        return "0".repeat(5 - bin.length) + bin
    }

    getCodeFromSymbol(RusABCsymbol) {
        return this.getCodeFromKey(this.getKey(RusABCsymbol))
    }
}