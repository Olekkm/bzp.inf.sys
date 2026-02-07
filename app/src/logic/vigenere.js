import { RusABC } from './abc.js'

class VigenereCoder {
    abc
    keyword

    //gets keyword and abc as arguments
    //has default values, so arguments can be skipped
    constructor(keyword, abc = new RusABC()) {
        if (keyword) {
            this.keyword = keyword
        }
        this.keyword = "_"
        this.abc = abc
    }

    //gets text and keyword
    //returns cyphered by Vigenere's method string
    Encode(plainText, keyword) {
        const _keyword = keyword ? keyword : this.keyword

        if (_keyword.length < 1) { throw new RangeError("") }

        for (const i of _keyword) {
            this.abc.checkSymbolInAbc(i)
        }

        let baseKey = "_"
        let encodedText = ""
        for (let i = 0; i < plainText.length; i++) {
            this.abc.checkSymbolInAbc(plainText[i])

            baseKey = this.abc.summarizeSymbols(baseKey, _keyword[i % _keyword.length])
            encodedText = encodedText + this.abc.summarizeSymbols(baseKey, plainText[i])
        }
        return encodedText
    }

    //gets cyphered text and keyword
    //returns decoded by Vigenere's method string
    Decode(encodedText, keyword) {
        const _keyword = keyword ? keyword : this.keyword

        if (_keyword.length < 1) { throw new RangeError("") }

        for (const i of _keyword) {
            this.abc.checkSymbolInAbc(i)
        }

        let baseKey = "_"
        let decodedText = ""
        for (let i = 0; i < encodedText.length; i++) {
            this.abc.checkSymbolInAbc(encodedText[i])

            baseKey = this.abc.summarizeSymbols(baseKey, _keyword[i % _keyword.length])
            decodedText = decodedText + this.abc.subtractSymbols(encodedText[i], baseKey)
        }
        return decodedText
    }

    #calcBlockKeyword(keyword) {
        let keyTemp = "____"
        const C = [1, -1, 1, 2, -2, 1, 1, 3, -1, 2]

        const _keyword = keyword + keyword

        for (let i = 0; i < 8; i++) {
            let b_TEMP = this.abc.getKeyArray(_keyword.substring(i * 2, i * 2 + 4))

            const a_TEMP = []
            for (let k = 0; k < 4; k++) {
                const x = (2 * i + k) % 10
                a_TEMP.push((64 + k + C[x] * b_TEMP[k]) % 32)
            }
            keyTemp = this.abc.summarizeText(keyTemp, this.abc.getTextFromKeys(a_TEMP))
        }
        return keyTemp
    }

    EncodeBlock(textBlock, keyword) {
        if (!(textBlock.length == 4 && keyword.length == 16)) { throw new Error("wrong length args") }

        return this.Encode(textBlock, this.#calcBlockKeyword(keyword))
    }

    DecodeBlock(textBlock, keyword) {
        if (!(textBlock.length == 4 && keyword.length == 16)) { throw new Error("wrong length args") }

        return this.Decode(textBlock, this.#calcBlockKeyword(keyword))
    }
}



export function consoleCheck() {
    const word = prompt("plainText")
    const key = prompt("key")
    const worker = new VigenereCoder()
    alert(worker.DecodeBlock(word, key))
}
