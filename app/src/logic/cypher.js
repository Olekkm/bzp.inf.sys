import {RusABC} from './abc.js'
export class CypherMachine {
    caesarChar(char,keyword){
        const abc = new RusABC();
        const char_key = abc.getKey(char)
        const new_char_key = (char_key + abc.getKey(keyword.slice(0,1)))%32+1
        const new_char = abc.getSymbol(new_char_key)
        return new_char
    }
    caesarCharDecode(char,keyword){
        const abc = new RusABC();
        const char_key = abc.getKey(char)
        const new_char_key = char_key - abc.getKey(keyword.slice(0,1))+1
        const new_char = abc.getSymbol(Math.abs(new_char_key % 32))

        return new_char
    }
}