import { RusABC } from "./abc";
import { OneWayCypherer } from "./оneWayCypherer";

export class RandomGenerator {
    //links to used classes
    ABC
    CypherCore

    //service values, not for direct access
    _seed
    _seedBin


    //sets and gets for seed.
    //set seed automaticaly sets binary array of seed word
    set seed(seed) {
        this._seedBin = this.blockToBinArray(seed)
        this._seed = seed
    }
    get seed() {
        return this._seed
    }
    get seedBinary() {
        return this._seedBin
    }

    //constructor
    //has default values so can be called without any parameters
    constructor(seed, ABC = RusABC, CypherCore = OneWayCypherer) {
        this.ABC = ABC
        this.CypherCore = CypherCore

        if (seed != undefined) {
            this.seed = seed
        }
    }


    //gets string (len = 4)
    //returns positive integer (number) 
    blockToNumber(TextBlock) {
        if (TextBlock.length != 4) {
            throw new Error("String lenght should be equal to 4")
        }

        let pos = 1
        let out = 0
        const arr = new this.ABC().getKeyArray(TextBlock)
        for (let i = 3; i > -1; i--) {
            out += pos * arr[i]
            pos *= 32
        }


        return BigInt(out)
    }


    //gets BigInt
    //returns string (len = 4)
    NumberToBlock(int64_Number) {
        if ((typeof int64_Number) !== "bigint") {
            throw new TypeError("wrong type provided. Should get bigint")
        }

        const temp = []
        for (let i = 0; i < 4; i++) {
            temp.push(Number(int64_Number % 32n))
            int64_Number = int64_Number / 32n
        }
        temp.reverse()

        return new this.ABC().getTextFromKeys(temp)
    }


    //gets bigint
    //returns array of 1's and 0's, represents binary form of input
    intToBinArray(int64_Number) {
        if ((typeof int64_Number) !== "bigint") {
            throw new TypeError("wrong type provided. Should get bigint")
        }

        let binaryString = int64_Number.toString(2)
        if (binaryString.length > 20) {
            throw new Error("input number is out of range")
        }

        binaryString = "0".repeat(20 - binaryString.length) + binaryString

        const binArr = []
        for (let i of binaryString) {
            binArr.push(+i)
        }
        return binArr
    }

    //gets array of 1's and 0's, represents binary number
    //returns decimal bigint number
    binArrayToInt(binArray) {
        return BigInt("0b" + binArray.join(''))
    }

    //gets string (len = 4)
    //returns array of 1's and 0's, represents binary number
    blockToBinArray(TextBlock) {
        return this.intToBinArray(this.blockToNumber(TextBlock))
    }

    //gets array of 1's and 0's, represents binary number
    //returns string (len = 4)
    binArrayToBlock(binArray) {
        return this.NumberToBlock(BigInt("0b" + binArray.join('')))
    }

    //gets string (len = 16) as seed
    //returns 4 strings (len = 12) in array
    //
    //waits update
    initGenerator(seed) {
        if (typeof seed !== "string") {
            throw new TypeError("input (seed) should be a string")
        }
        if (seed.length != 16) {
            throw new Error("input lenght is out of range (!= 16)")
        }

        const C = [
            "ПЕРВОЕ_АКТЕРСТВО",
            "ВТОРОЙ_ДАЛЬТОНИК",
            "ТРЕТЬЯ_САДОВНИЦА",
            "ЧЕТВЕРТЫЙ_ГОБЛИН"
        ]

        const ABC = new this.ABC()
        const Core = new this.CypherCore()
        const Value = []

        for (let i = 0; i < 4; i++) {
            Value.push(Core.cBlock([C[i], seed], 16))
        }

        const secret = Core.cBlock(Value, 16)
        const out = []

        for (let i = 0; i < 4; i++) {
            let temp = Value[i]
            let TEMP = ""

            for (let j = 0; j < 4; j++) {
                temp = ABC.summarizeText(temp, C[i])
                TEMP = TEMP + Core.cBlock([temp, secret], 4)
                temp = ABC.summarizeText(temp, TEMP)
            }

            out.push(TEMP.substring(4, 16))
        }

        return out
    }


    //gets array of 1's and 0's, represents binary number,
    //bitValue - value of 0 or 1
    //
    //shifts array e.g. [1, 0 ... 1] => [0 ... 1, bitValue]
    //returns shifted array
    //does not mutate input array
    pushRegister(binArray, bitValue = 0) {
        if (!(bitValue in [0, 1])) {
            throw new TypeError("bit value must be 0 or 1, number type")
        }
        const _binArray = binArray.slice()

        _binArray.shift()
        _binArray.push(bitValue)
        return _binArray
    }


    //gets array of numbers (integers) in range [1, 20]
    //returns binary array (len = 20) with 1's in places specified in input array
    tapsToBinaryArray(Taps) {
        const taps = ((taps, outArr) => {
            for (let elem of taps) {
                if (!Number.isInteger(elem)) {
                    throw new TypeError(`all elements of Taps array should be integers and type of number (${elem} - incorrect value)`)
                }
                if ((elem < 1) || elem > 20) {
                    throw new Error(`all elements of Taps array should be in range of [1, 20] (${elem} - incorrect value)`)
                }
                outArr[20 - elem] = 1
            }
            return outArr
        })(Taps, Array(20).fill(0))

        return taps
    }

    pushLFSR(state, taps) {
        if (state == undefined && this.seed == undefined) {
            throw new Error("seed must be set in object or provided to function (state input)")
        }

        const _state = state !== undefined ? state : this.seedBinary
        let temp = 0
        for (let i = 0; i < Math.min(_state.length, taps.length); i++) {
            temp += _state[i] * taps[i]
        }

        return this.pushRegister(_state, temp % 2)
    }

    nextLFSR(state, taps) {
        if (state == undefined && this.seed == undefined) {
            throw new Error("seed must be set in object or provided to function (state input)")
        }

        let _state = state !== undefined ? state.slice() : this.seedBinary.slice() //slice to copy array
        const stream = []
        for (let i = 0; i < 20; i++) {
            _state = this.pushLFSR(_state, taps)
            stream.push(_state[19])
        }
        return [stream, _state]
    }
}

export function consoleCheck() {
    const worker = new RandomGenerator()
}