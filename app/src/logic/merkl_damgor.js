import {RusABC} from './abc.js'
import { OneWayCypherer }  from './оneWayCypherer.js'
export class Merkl_Damgor{
    merDam_hash(msg){
        var data = this.pad_MD(msg)
        const ows = new OneWayCypherer()
        var tmp = ''
        var n = Math.floor(data.length/64)
        var state
        let a = "________________"
        let b = "________________"
        let c = "________________"
        let d = "________________"
        let e = "________________"
        
        for (let i = 0;i<n;i++)
            {
                tmp = data.slice(i*64,i*64+64)
                state = this.macrocompression(tmp,a+b+c+d+e)
                ;[a,b,c,d,e] = state
            }    
        const p1 = ows.cBlock([a,e],16)
        const p2 = ows.cBlock([b,e],16)
        const p3 = ows.cBlock([c,e],16)
        const p4 = ows.cBlock([d,e],16)

        return p1+p2+p3+p4
    }

    blocks_mix(in1,in2){
        const abc = new RusABC()
        var out = []
        var in1 = in1.split('').reverse().join('')
        out.push(abc.summarizeText(in1,in2))
        out.push(abc.subtractText(in1,in2))

        return out
    }
    blocks_mask(input_text,const1){
        const abc = new RusABC()
        var out = []
        var arr = abc.getKeyArray(input_text)
        var con = abc.getKeyArray(const1)
        for (let i=0;i<16;i++)
        {
            if (arr[i]<con[i]+i)
            {
                out[i] = (64-con[i]+i) % 32
            }
            else
            {
                out[i] = (arr[i] + i) % 32
            }
        }
        return abc.getTextFromKeys(out)
    }
    macrocompression(inp,state){
        var abc = new RusABC()
        var ows = new OneWayCypherer()
        var a = abc.summarizeText(inp.slice(0,16),state.slice(0,16))
        var b = abc.summarizeText(inp.slice(16,32),state.slice(16,32))
        var c = abc.summarizeText(inp.slice(32,48),state.slice(32,48))
        var d = abc.summarizeText(inp.slice(48,64),state.slice(48,64))
        var e = state.slice(64,80)
        con = 'ААААЯЯЯЯААЯЯААЯЯ'
        for (let i = 0; i<12; i++)
        {
            e = abc.summarizeText(e,ows.cBlock([a,b,c,d],16))
            var tmp = this.blocks_mix(c,d)
            var con = abc.summarizeText(con,'ААААЯЯЯЯААЯЯААЯЯ')
            c = tmp[0]
            d = tmp[1]
            b = this.blocks_mask(b,con)
            var [a,b,c,d,e]=[b,c,d,e,a]
             
        }
        return [a,b,c,d,e]   
    }
    pad_MD(inp)
    {
        var out = inp
        var l = inp.length
        
        var rem = 64 - (l % 64)
        if (rem != 64)
        {
            out = out + '_'.repeat(rem)
        }
        
        return out
    }   
    
}



const md = new Merkl_Damgor()
const s1 = "КЬЕРКЕГОР_ПРОПАЛ"
const s2 = 'ХОРОШО_БЫТЬ_ВАМИ'
const ows = new OneWayCypherer()

// console.log(md.merDam_hash(md.pad_MD(s1+s2)))