import { RusABC } from "./abc.js";
import { RandomGenerator } from "./randomGenerator.js";
import { VigenereCoder } from "./vigenere.js";

export class SPNet extends RandomGenerator {
    constructor(seed, ABC, CypherCore) {
        super(seed, ABC, CypherCore);
    }

    //gets two blocks (len = 4)
    //returns bitwise XOR of them converted to string (len = 4)
    subBlockXOR(BlockA, BlockB) {
        if (typeof BlockA !== "string" || typeof BlockB !== "string") {
            throw new TypeError("blocks must be string type");
        }

        if (BlockA.length !== 4 || BlockB.length !== 4) {
            throw new Error("length of blocks must be equal to 4");
        }

        const outInt = this.blockToNumber(BlockA) ^ this.blockToNumber(BlockB);
        return this.NumberToBlock(outInt);
    }

    //gets two blocks (len = n * 4)
    //returns bitwise XOR of them converted to string (len = n * 4)
    blockXOR(BlockA, BlockB) {
        if (typeof BlockA !== "string" || typeof BlockB !== "string") {
            throw new TypeError("blocks must be string type");
        }

        if (BlockA.length !== BlockB.length) {
            throw new Error("blocks' lengths must be equal");
        }

        if (BlockA.length % 4 !== 0 || BlockA.length < 4) {
            throw new Error("blocks' lengths should match n*4");
        }

        let out = "";

        for (let i = 0; i < BlockA.length; i = i + 4) {
            out += this.subBlockXOR(
                BlockA.slice(i, i + 4),
                BlockB.slice(i, i + 4),
            );
        }

        return out;
    }

    //generates constants
    //returns array (len = 3) containing arrays (len = 20) of binary digits
    makeLfsrSet() {
        const out = [
            this.tapsToBinaryArray([20, 17]),
            this.tapsToBinaryArray([20, 19, 16, 14]),
            this.tapsToBinaryArray([20, 9, 5, 3]),
        ];

        return out;
    }

    //gets key: string (len = 16)
    //     genCount: number (integer)
    //     RngSet: array of arrays containing taps in binary form
    //
    //returns array (len = genCount) of strings (len = 16)
    produceRoundKeys(key, genCount, RngSet) {
        if (typeof key !== "string" || typeof genCount != "number") {
            throw new TypeError(
                "error in function parameters: key must be a string; genCount must be a number",
            );
        }

        if (key.length !== 16) {
            throw new Error("key length should be equal to 16");
        }

        if (genCount <= 0) {
            throw new Error("genCount should be at least 1");
        }

        const out = [];
        let intern;

        let temp;

        [temp, intern] = this.cAsLFSRnext("up", -1, key, RngSet);
        out.push(temp);

        for (let i = 1; i < genCount; i++) {
            [temp, intern] = this.cAsLFSRnext("down", intern, -1, RngSet);
            out.push(temp);
        }

        return out;
    }
    //Принимает на вход шифруемый текст и магический квадрат(1 из 820)
    frw_MagicSquare(block_in, mat_in) {
        var d = block_in
        var m = mat_in
        var out = ""
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out = out + d.slice(m[i][j]-1, m[i][j])
            }
        }
        return out
    }
    //Обратныый магический расшифровщик, берёт квадрат использованный при шифровке и энкодед стринги
    inv_MagicSquare(block_in,mat_in){
        const abc = new RusABC
        var d = abc.getKeyArray(block_in)
        var m = mat_in
        var tmp = []
        for (let i = 0; i < 4; i++){
            for (let j = 0; j < 4; j++){
                tmp[m[i][j]-1] = d[4*i+j]
            }
        }
        return  abc.getTextFromKeys(tmp)
    }
    //Циклический сдвиг влево и вправо, принимает на вход массив битов
    //
    binary_shift(array_in,shift_in){
        var s = array_in.length
        var b = ((shift_in % s) + s) % s
        var out = []
        if (b > 0)
        {
            for(let i = b; i < s; i++)
            {
                out[i] = array_in[i-b]
            }
            for(let i = 0; i < b; i++)
            {
                out[i] = array_in[s-b+i]
            }
        }
        else
        {
            for(let i = 0; i<s+b; i++)
            {
                out[i] = array_in[i-b]
            }
            for(let i = s+b; i< s-1; i++)
            {
                out[i] = array_in[i-s-b]
            }
        }
        return out
    }
    lb2b(block_in){
        var tmp = []
        var t =''
        var out = []
        for(let q = 0;q < 4; q++)
        {  
            t = block_in.slice(q*4,q*4+4)
            tmp = this.intToBinArray(this.blockToNumber(t))
            for(let i = 0; i < 20; i++)
                {
                    out[i+q*20] = tmp[i]
                } 
        }
        return out
    }
    b2lb(block_in){
        var abc = new RusABC
        var out = ''
        var tmp = []
        var t = ""
        for(let q = 0; q < 4; q++)
        {
            for(let i = 0; i<20; i++)
            {
                tmp[i] = block_in[i+q*20]
            }
            t = this.NumberToBlock(this.binArrayToInt(tmp))
            out = out + t

        }
        return out
    }
    frw_P_round(block_in,r_in){
        const m = []
        m[0] = [
            [16, 3, 2, 13],
            [5, 10, 11, 8],
            [9, 6, 7, 12],
            [4, 15, 14, 1]]
        m[1] = [
            [7, 14, 4, 9],
            [12, 1, 15, 6],
            [13, 8, 10, 3],
            [2, 11, 5, 16]]
        m[2] = [
            [4, 14, 15, 1],
            [9, 7, 6, 12],
            [5, 11, 10, 8],
            [16, 2, 3, 13]]
        var r = r_in % 3
        var j = 4*(r_in % 4) + 2
        var tmp = this.frw_MagicSquare(block_in,m[r])

        var t = this.binary_shift(this.lb2b(tmp),j)
        return this.b2lb(t)
    }
    inv_P_round(block_in,r_in){
        const m = []
        m[0] = [
            [16, 3, 2, 13],
            [5, 10, 11, 8],
            [9, 6, 7, 12],
            [4, 15, 14, 1]]
        m[1] = [
            [7, 14, 4, 9],
            [12, 1, 15, 6],
            [13, 8, 10, 3],
            [2, 11, 5, 16]]
        m[2] = [
            [4, 14, 15, 1],
            [9, 7, 6, 12],
            [5, 11, 10, 8],
            [16, 2, 3, 13]]
        var r = r_in % 3
        var j = -(4* (r_in % 4) + 2)
        var T = this.binary_shift(this.lb2b(block_in),j)
        return this.inv_MagicSquare(this.b2lb(T),m[r])
    }
    frw_round_SP(block_in,key_in,r_in){
        var inter = ''
        var vig = new VigenereCoder()
        for(let i = 0; i < 4; i++)
        {
            let t = block_in.slice(i*4,i*4+4)
            inter = inter + vig.EncodeBlockMod(t,key_in)
        }
        const tmp = this.frw_P_round(inter,r_in)
        return this.blockXOR(tmp,key_in)
    }
    inv_round_SP(block_in,key_in,r_in)
    {
        var vig = new VigenereCoder
        var out = ''
        var tmp = this.blockXOR(block_in,key_in)
        var inter = this.inv_P_round(tmp,r_in)
        for(let i = 0; i < 4; i++){
            let t = inter.slice(i*4,i*4+4)
            out = out + vig.DecodeBlockMod(t,key_in)
        }
        return out
    }
    frw_SPNet(block_in,key_set,r_in)
    {
        var block = block_in
        for(let i = 0;i < r_in; i++)
        {
            block = this.frw_round_SP(block,key_set[i],i)
        }
        return block
    }
    inv_SPNet(block_in,key_set,r_in)
    {
        var block = block_in
        for (let i = r_in-1;0;r_in--)
            {
                block = this.inv_round_SP(block,key_set[i],i)
            }
        return block
    }
}

export function consoleCheck() {
    // const worker = new SPNet();
    // // const a = prompt("A");
    // // const b = prompt("B");
    // const set1 = [
    //     worker.tapsToBinaryArray([19, 18]),
    //     worker.tapsToBinaryArray([18, 7]),
    //     worker.tapsToBinaryArray([17, 3]),
    // ];
    // const set2 = [
    //     worker.tapsToBinaryArray([19, 18]),
    //     worker.tapsToBinaryArray([18, 7]),
    //     worker.tapsToBinaryArray([16, 14, 13, 11]),
    // ];
    // const set3 = [
    //     worker.tapsToBinaryArray([19, 18]),
    //     worker.tapsToBinaryArray([18, 7]),
    //     worker.tapsToBinaryArray([15, 13, 12, 10]),
    // ];
    // const set4 = [
    //     worker.tapsToBinaryArray([19, 18]),
    //     worker.tapsToBinaryArray([18, 7]),
    //     worker.tapsToBinaryArray([14, 5, 3, 1]),
    // ];
    // const set = [set1, set2, set3, set4];
    // console.log(worker.produceRoundKeys("ПОЛИМАТ_ТЕХНОБОГ", 6, set));
}
const worker = new SPNet();
const m1 = [[16,3,2,13],
            [5,10,11,8],
            [9,6,7,12],
            [4,15,14,1]]
const n = 'АБВГДЕЖЗИЙКЛМНОП'
console.log(worker.frw_MagicSquare(n,m1))
console.log(worker.inv_MagicSquare(worker.frw_MagicSquare(n,m1),m1))
console.log(worker.binary_shift(worker.intToBinArray(worker.blockToNumber('ГОЛД')),1))
console.log(worker.lb2b("ЗОЛОТАЯ_СЕРЕДИНА"))
console.log(worker.b2lb(worker.lb2b("ЗОЛОТАЯ_СЕРЕДИНА")))
console.log(worker.frw_P_round("ЗОЛОТАЯ_СЕРЕДИНА",2))
console.log(worker.inv_P_round(worker.frw_P_round("ЗОЛОТАЯ_СЕРЕДИНА",2),2))
console.log(worker.frw_round_SP('КОРЫСТЬ_СЛОНА_ЭХ','МТВ_ВСЕ_ЕЩЕ_ТЛЕН',0))
console.log(worker.inv_round_SP(worker.frw_round_SP('КОРЫСТЬ_СЛОНА_ЭХ','МТВ_ВСЕ_ЕЩЕ_ТЛЕН',0),'МТВ_ВСЕ_ЕЩЕ_ТЛЕН',0))
const set1 = [
        worker.tapsToBinaryArray([19, 18]),
        worker.tapsToBinaryArray([18, 7]),
        worker.tapsToBinaryArray([17, 3]),
    ];
    const set2 = [
        worker.tapsToBinaryArray([19, 18]),
        worker.tapsToBinaryArray([18, 7]),
        worker.tapsToBinaryArray([16, 14, 13, 11]),
    ];
    const set3 = [
        worker.tapsToBinaryArray([19, 18]),
        worker.tapsToBinaryArray([18, 7]),
        worker.tapsToBinaryArray([15, 13, 12, 10]),
    ];
    const set4 = [
        worker.tapsToBinaryArray([19, 18]),
        worker.tapsToBinaryArray([18, 7]),
        worker.tapsToBinaryArray([14, 5, 3, 1]),
    ];
    const set = [set1, set2, set3, set4];
    const lc = worker.produceRoundKeys("МТВ_ВСЕ_ЕЩЕ_ТЛЕН", 8, set)
    console.log(worker.frw_SPNet("КОРЫСТЬ_СЛОНА_ЭХ",lc,8))