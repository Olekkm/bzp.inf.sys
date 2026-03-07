import { RandomGenerator } from "../../logic/randomGenerator";
import { RusABC } from "../../logic/abc";

const REPLICATIONS = 200;
const OUTPUTS_NEEDED = 50;

const SET = [
    [[19,18], [18,7], [17,3]],
    [[19,18], [18,7], [16,14,13,11]],
    [[19,18], [18,7], [15,13,12,10]],
    [[19,18], [18,7], [14,5,3,1]]
];

// eslint-disable-next-line no-undef
test("Тест на длину серии единиц", () => {
    const gen = new RandomGenerator();
    const abc = new RusABC();
    const letters = Object.values(abc.ABC);
    
    let passed = 0;
    const maxRunLengths = []; 

    for (let rep = 0; rep < REPLICATIONS; rep++) {
        let seed = '';
        for (let i = 0; i < 16; i++) seed += letters[(rep + i * 13) % 32];
        
        let bits = [];
        let state = null;
        
        const binarySet = SET.map(genArr => 
            genArr.map(taps => gen.tapsToBinaryArray(taps))
        );

        for (let out = 0; out < OUTPUTS_NEEDED; out++) {
            
            const [stream, newState] = gen.cAsLFSRnext(
                out ? 'down' : 'up', 
                state, 
                out ? null : seed, 
                binarySet
            );
            
            for (let c of stream) { 
                bits.push(...abc.getCodeFromKey(abc.getKey(c)).split('').map(Number));
            }
            state = newState;
        }
        
        let currRunOnes = 0;
        let currRunZeros = 0;
        let maxRunOnes = 0;
        let maxRunZeros = 0;
        
        for (let i = 0; i < bits.length; i++) {
            if (bits[i] === 1) {
                currRunOnes++;
                currRunZeros = 0;
                if (currRunOnes > maxRunOnes) maxRunOnes = currRunOnes;
            } else { // bits[i] === 0
                currRunZeros++;
                currRunOnes = 0;
                if (currRunZeros > maxRunZeros) maxRunZeros = currRunZeros;
            }
        }
        const maxRun = Math.max(maxRunOnes, maxRunZeros);

        if(maxRun >= 10 && maxRun <= 15) passed++;
        
        maxRunLengths.push(maxRun);
    }
    
    
    console.log('количество прошедших репликаций:', passed);
    console.log('Гистограмма')
    const bins = [5, 10, 15, 20, 25, 30];
    let histogram = '';
    
    for (let i = 0; i < bins.length - 1; i++) {
        const from = bins[i];
        const to = bins[i+1];
        const count = maxRunLengths.filter(x => x >= from && x < to).length;
        
        if (count > 0 || i < 10) {
            const bar = '🎀'.repeat(Math.ceil(count / 3)); 
            histogram += `${from.toFixed(1).padStart(5)} - ${to.toFixed(1).padStart(5)} : ${bar.padEnd(50)} ${count}\n`;
        }
    }
    console.log(histogram);
    // eslint-disable-next-line no-undef
    expect(passed).toBeGreaterThan(REPLICATIONS * 0.85);
});