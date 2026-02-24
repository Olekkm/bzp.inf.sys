import { RusABC } from "./abc";

export class OneWayCypherer {
    ABC

    Encode

    constructor(ABC = new RusABC()) {
        this.ABC = ABC
    }


    //core cypher function
    //gets two strings len=16
    //returns cyphered text
    coreCypherFunction(prime, aux) {
        if ((prime.length != 16) || (aux.length != 16)) {
            throw new Error("wrong inputs lengths")
        }

        const C1 = [1, 1, -1]
        const C2 = [4, 3, 2, 1, -1, -2, -3, -4]

        const _aux = this.ABC.getKeyArray(aux)
        const _prime = this.ABC.getKeyArray(prime)
        const arr = []

        let temp = 0

        const c1 = _prime[2] % 3
        const c2 = _prime[10 + c1] % 8
        const c3 = _prime[3 + c2] % 16

        for (let i = 0; i < 32; i++) {
            const vars = [(c1 + i) % 3, (c2 + i) % 8, (c3 + i) % 16, i % 16]
            temp = (temp + 64 + _prime[vars[2]] + (C1[vars[0]] * _aux[[vars[3]]]) + C2[[vars[1]]]) % 32
            arr[vars[3]] = temp
        }

        return this.ABC.getTextFromKeys(arr)
    }


    //service function to check parameters of array
    //
    //parameters to be checked:
    //elementsMin - minimal amount of elements
    //elementsMax - maximal amount of elements
    //*(elementsMin <= elements' amount <= elementsMax)*
    //elementsLength - lenght of every element in array
    //*(element's lenght == elementsLength)*
    #checkInputArray(array, elementsMin, elementsMax, elementsLength) {
        if (!(elementsMin <= array.length <= elementsMax)) {
            return false
        }
        for (let element of array) {
            if (element.length != elementsLength) { return false }
        }
        return true
    }


    //c-block function
    //gets array of 1-4 elements
    //elements are strings len=16
    //outSize(integer) - one of [4, 8, 16]
    //returns cyphered string
    cBlock(array, outSize) {
        if (!this.#checkInputArray(array, 1, 4, 16)) {
            throw new Error("wrong input array type")
        }

        let C = [
            "________________",
            "ПРОЖЕКТОР_ЧЕПУХИ",
            "КОЛЫХАТЬ_ПАРОДИЮ",
            "КАРМАННЫЙ_АТАМАН"
        ]

        for (let i = 0; i < array.length; i++) {
            C[i] = this.ABC.summarizeText(C[i], array[i])
        }

        C = this.mixinputs(C)

        const temp = []

        temp.push(this.coreCypherFunction(C[0], C[2]))
        temp.push(this.coreCypherFunction(C[3], C[1]))
        temp.push(this.confuse(temp[0], temp[1]))
        temp.push(this.coreCypherFunction(temp[2], temp[0]))

        return this.compress(temp[3], outSize)
    }


    //core cypher function
    //gets two strings len=16
    //returns cyphered text
    confuse(input_1, input_2) {
        if (!(this.#checkInputArray([input_1, input_2], 2, 2, 16))) {
            throw new Error("wrong input array type")
        }

        const arr_1 = this.ABC.getKeyArray(input_1)
        const arr_2 = this.ABC.getKeyArray(input_2)

        for (let i = 0; i < 16; i++) {
            if (arr_1[i] > arr_2[i]) {
                arr_1[i] = (arr_1[i] + i) % 32
            }
            else {
                arr_1[i] = (arr_2[i] + i) % 32
            }
        }

        let out = this.ABC.getTextFromKeys(arr_1)
        out = this.ABC.summarizeText(out, input_1)
        out = this.ABC.summarizeText(out, input_2)
        return out
    }


    //compress function
    //gets string len=16 and size 
    //textToCompress is string len=16
    //outSize(integer) - one of [4, 8, 16]
    compress(textToCompress, size) {
        if (textToCompress.length != 16) {
            throw new Error("wrong length of compressed text")
        }

        const getArr = () => {
            return [
                textToCompress.substring(0, 4),
                textToCompress.substring(4, 8),
                textToCompress.substring(8, 12),
                textToCompress.substring(12, 16)
            ]
        }

        switch (size) {
            case 16:
                return textToCompress
                break;
            case 8:
                const subStrs8 = getArr()
                return this.ABC.summarizeText(subStrs8[0] + subStrs8[2], subStrs8[1] + subStrs8[3])
                break;
            case 4:
                const subStrs4 = getArr()
                return this.ABC.summarizeText(this.ABC.subtractText(subStrs4[0], subStrs4[2]), this.ABC.subtractText(subStrs4[1], subStrs4[3]))
                break;
            default:
                throw new Error("unsupported compression size")
                break;
        }
    }

    //gets array of 4 elements
    //elements are strings len=16
    //returns mixed array
    mixinputs(in_arr) {
        const out = []
        out.push(this.ABC.summarizeText(in_arr[0], in_arr[1]))
        out.push(this.ABC.subtractText(in_arr[0], in_arr[1]))
        out.push(this.ABC.summarizeText(out[1], this.ABC.summarizeText(in_arr[2], in_arr[3])))
        out.push(this.ABC.summarizeText(out[0], this.ABC.subtractText(in_arr[2], in_arr[3])))

        return out
    }
}

export function consoleCheck() {
    const a = prompt()
    const b = prompt()

    alert(new OneWayCypherer().confuse(a, b))
}