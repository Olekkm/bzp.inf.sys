import { RusABC } from './abc.js'

class VigenereCoder {
    abc
    keyword

    Encode
    Decode

    //gets type, keyword and abc as arguments
    //has default values, so arguments can be skipped
    //
    //types: "BaseVigenere" (text: string any length, keyword: string any lenght)
    //       "S_Block" (text: string length = 4, keyword: string lenght = 16)
    //       "Merge_Block" (text: string length = 4, keyword: string lenght = 16)
    //       "S_Block_Mod" (text: string length = 4, keyword: string lenght = 16)
    //        default: "BaseViginere"
    constructor(type, keyword, abc = new RusABC()) {
        if (keyword != undefined) {
            this.keyword = keyword
        }
        else { this.keyword = "_" }

        this.abc = abc

        const encoder = {
            "BaseVigenere": [this.BaseViginereEncode, this.BaseVigenereDecode],
            "S_Block": [this.EncodeBlock, this.DecodeBlock],
            "Merge_Block": [(textBlock, keyword) => this.mergeBlock(textBlock, keyword, true),
            (textBlock, keyword) => this.mergeBlock(textBlock, keyword, false)],
            "S_Block_Mod": [this.EncodeBlockMod, this.DecodeBlockMod]
        }

        if (type == undefined) {
            [this.Encode, this.Decode] = encoder["BaseVigenere"]
        }
        else {
            if (encoder[type] == undefined) { throw new Error("incorrect encoder type") }
            [this.Encode, this.Decode] = encoder[type]
        }
    }

    //gets text and keyword
    //returns cyphered by Vigenere's method string
    BaseViginereEncode(plainText, keyword) {
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
    BaseVigenereDecode(encodedText, keyword) {
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


    //service function to calculate block keyword
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

    //basic S-block encoder
    //gets textBlock (string of 4 symbols) and key (string of 16 symbols)
    //returns encoded textBlock
    EncodeBlock(textBlock, keyword) {
        if (!(textBlock.length == 4 && keyword.length == 16)) { throw new Error("wrong length args") }

        return this.BaseViginereEncode(textBlock, this.#calcBlockKeyword(keyword))
    }

    //basic S-block decoder
    //gets encoded textBlock (string of 4 symbols) and key (string of 16 symbols)
    //returns decoded textBlock
    DecodeBlock(textBlock, keyword) {
        if (!(textBlock.length == 4 && keyword.length == 16)) { throw new Error("wrong length args") }

        return this.BaseVigenereDecode(textBlock, this.#calcBlockKeyword(keyword))
    }


    //placeholder for encoding with block merge (frw_merge_block в презентации)
    mergeBlock(blockIn, keyIn, encode) {
        if (blockIn.length != 4 || keyIn.length != 16 || typeof blockIn !== 'string' || typeof keyIn !== 'string') {
            return "input-error"
        }
        let M = [0, 1, 2, 3]
        let sum = 0
        const array = this.abc.getKeyArray(keyIn)
        for (let i = 0; i < 16; i++) {
            let a = (24 + sum + (-1) ** i * array[i]) % 24
            sum = (24 + sum + (-1) ** i * array[i]) % 24

        }
        for (let k = 0; k < 3; k++) {
            let t = sum % (4 - k)
            sum = (sum - t) / (4 - k)
            let tmp = M[k]
            M[k] = M[k + t]
            M[k + t] = tmp
        }
        var inp = this.abc.getKeyArray(blockIn)
        if (encode == true) {
            for (let j = 0; j < 4; j++) {
                let b = M[(1 + j) % 4]
                let a = M[j % 4]
                inp[b] = (inp[b] + inp[a]) % 32
            }
        }
        if (encode == false) {
            for (let j = 3; j > -1; j--) {
                let b = M[(1 + j) % 4]
                let a = M[j % 4]
                inp[b] = (32 + inp[b] - inp[a]) % 32
            }
        }
        return this.abc.getTextFromKeys(inp)
    }

    //Modified S-block encoder
    //gets textBlock (string of 4 symbols) and key (string of 16 symbols)
    //returns encoded textBlock
    EncodeBlockMod(textBlock, keyword) {
        let temp = this.mergeBlock(textBlock, keyword, true)
        temp = this.EncodeBlock(temp, keyword)
        return this.mergeBlock(temp, keyword, true)
    }

    //Modified S-block decoder
    //gets encoded textBlock (string of 4 symbols) and key (string of 16 symbols)
    //returns decoded textBlock
    DecodeBlockMod(textBlock, keyword) {
        let temp = this.mergeBlock(textBlock, keyword, false)
        temp = this.DecodeBlock(temp, keyword)
        return this.mergeBlock(temp, keyword, false)
    }
}



export function consoleCheck() {
    const word = prompt("plainText")
    const key = prompt("key")
    const worker = new VigenereCoder("S_Block_Mod")
    const coded = worker.Encode(word, key)
    alert(coded)
    alert(worker.Decode(coded, key))
}