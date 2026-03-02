import { RusABC } from "./abc.js";

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

        const C1 = [1, -1, 1, -1, 1, -1, 1]
        const C2 = [1, -1, 1, -1, 1]

        const _aux = this.ABC.getKeyArray(aux)
        const _prime = this.ABC.getKeyArray(prime)
        const arr = []

        let temp = 0
        const t1 = _aux.reduce((accum, current) => accum + current, 0)

        const c = []
        c.push(t1 % 7)
        c.push(_prime[2 * c[0] + 1] % 5)
        c.push((_prime[2 * c[1]] + _prime[2 * c[0]]) % 16)

        for (let i = 0; i < 16; i++) {
            const [q, j, p] = [(c[0] + i) % 7, (c[1] + i) % 5, (c[2] + i) % 16]
            temp = (temp + 64 + _prime[p] + (C1[q] * C2[j] * _aux[i])) % 32
            arr.push(temp)
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
    const a = "ХОРОШО_БЫТЬ_ВАМИ"
    const b = "КЬЕРКЕГОР_ПРОПАЛ"

    console.log(new OneWayCypherer().coreCypherFunction(b, a))
}