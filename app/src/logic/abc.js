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

    //gets key as integer from 1 to 32
    //returns symbol (string) from abc
    getSymbol(key) {
        if (!Number.isInteger(key)) {
            throw new TypeError("key argument must be an integer")
        }

        if (key < this.minKey || key > this.maxKey) {
            throw new RangeError("key is out of range")
        }


        //console.log(typeof this.ABC[key])
        return this.ABC[key]
    }


    //gets symbol from abc
    //returns symbol's key in abc (number)
    getKey(RusABCsymbol) {
        //const values = Object.keys(this.ABC)
        const key = Object.keys(this.ABC).find(searchedKey => this.ABC[searchedKey] === RusABCsymbol)
        if (key == undefined) { throw new Error("symbol was not found") }

        //console.log(typeof parseInt(key))
        return parseInt(key)
    }


    //gets key as integer from 1 to 32
    //returns five symbols string that represents binary code of symbol  
    getCodeFromKey(key) {
        if (!Number.isInteger(key)) {
            throw new TypeError("key argument must be an integer")
        }

        if (key < this.minKey || key > this.maxKey) {
            throw new RangeError("key is out of range")
        }

        if (key === 32) { return "00000" }


        const bin = key.toString(2)
        //console.log(typeof ("0".repeat(5 - bin.length) + bin))
        return "0".repeat(5 - bin.length) + bin
    }


    //gets symbol from abc
    //returns five symbols string that represents binary code of symbol 
    getCodeFromSymbol(RusABCsymbol) {
        //console.log(typeof this.getCodeFromKey(this.getKey(RusABCsymbol)))
        return this.getCodeFromKey(this.getKey(RusABCsymbol))
    }


    //gets two symbols and returns 
    //symbol with key value equal sum of input symbol's keys.
    //if sum > 32 (ABC maximum) key repeats from start (e. g. "Я" + "Б" = "А")
    summarizeSymbols(symbol_A, symbol_B) {
        this.checkSymbolInAbc(symbol_A);
        this.checkSymbolInAbc(symbol_B);

        const sum = this.getKey(symbol_A) + this.getKey(symbol_B)

        return this.getSymbol(sum > 32 ? sum - 32 : sum);
    }


    //gets two symbols and returns 
    //symbol with key value equal difference between symbol_A's key and symbol_B's (symbol_A - symbol_B).
    //if difference < 1 (ABC minimum) key goes from back (e. g. key = -3 is equal to key = 29)
    subtractSymbols(symbol_A, symbol_B) {
        this.checkSymbolInAbc(symbol_A);
        this.checkSymbolInAbc(symbol_B);

        const subst = this.getKey(symbol_A) - this.getKey(symbol_B)

        return this.getSymbol(subst < 1 ? 32 + subst : subst);
    }


    //gets any symbol
    //returns true for symbols in abc, otherwise false.
    //error if argument not a symbol (string with length equals 1)
    checkSymbolInAbc(symbol) {
        if (symbol.length > 1) {
            throw new TypeError(
                "symbol argument must be a symbol (string with length equals 1)"
            )
        }

        return Object.keys(this.ABC).find(searchedKey => this.ABC[searchedKey] === symbol) ? true : false
    }
}

export function consoleCheck() {
    try {
        const ABC = new RusABC
        let symbol_A = prompt("A").toString()
        let symbol_B = prompt("B").toString()
        //alert(ABC.checkSymbolInAbc(symbol))
        alert(ABC.subtractSymbols(symbol_A, symbol_B))
    }
    catch (e) {
        alert(e.message)
    }
}
//helloWorld("Print")