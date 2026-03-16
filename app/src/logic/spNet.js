import { RandomGenerator } from "./randomGenerator";

export class SPNet extends RandomGenerator {
    parent = RandomGenerator;

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

        const rngSet = RngSet == null ? this.makeLfsrSet() : RngSet;

        const out = [];
        let intern;

        let temp;

        [temp, intern] = rngFunc("up", -1, key, rngSet);
        out.push(temp);

        for (let i = 1; i < genCount; i++) {
            [temp, intern] = rngFunc("down", intern, -1, rngSet);
            out.push(temp);
        }

        return out;
    }
}

export function consoleCheck() {
    const worker = new SPNet();
    // const a = prompt("A");
    // const b = prompt("B");
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

    console.log(worker.produceRoundKeys("ПОЛИМАТ_ТЕХНОБОГ", 6, set));
}
