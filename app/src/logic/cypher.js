import {RusABC} from './abc.js'
export class CypherMachine {
    caesarChar(char,keyword){
        const abc = new RusABC();
        return abc.summarizeSymbols(char,keyword.slice(0,1))
    }
    caesarCharDecode(char,keyword){
        const abc = new RusABC();
        return abc.subtractSymbols(char,keyword.slice(0,1))
    }
}