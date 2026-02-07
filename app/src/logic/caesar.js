import {RusABC} from './abc.js'
export class CypherMachine {
    caesarCharEncode(char,keyword){
        const abc = new RusABC();
        return abc.summarizeSymbols(char,keyword.slice(0,1))
    }
    caesarCharDecode(char,keyword){
        const abc = new RusABC();
        return abc.subtractSymbols(char,keyword.slice(0,1))
    }
    encode(text, key){
        var encodedText = ""
        for (var i=0;i<text.length;i++)
        {
            encodedText = encodedText + this.caesarCharEncode(text[i],key)
        }
        return encodedText
    }
    decode(encodedText,key){
        var decodedText = ""
        for (var i=0;i<text.length;i++){
            decodedText = decodedText + this.caesarCharDecode(encodedText[i],key)
        }
        return decodedText
    }
}