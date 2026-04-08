import { RusABC } from "./abc.js"
import { Merkl_Damgor } from "./merkl_damgor.js"
import fs from 'fs';
export class lab5{
    //принимает строку, строку, масив строк, массив чисел, число
    //возвращает массив строк
    kdf(mat_in, salt_in, con_in, size_in, iter_in) 
    {
        const abc = new RusABC()
        const md = new Merkl_Damgor()
        var tmp = mat_in + salt_in
        var out = []
        for (let i=0;i<=iter_in;i++)
        {
            let ext = md.merDam_hash(tmp)
            tmp = ext + tmp
        }
        const prk = tmp
        for(let i=0;i<=size_in.length-1;i++)
        {
            let q = Math.floor(size_in[i] / 64)
            let rem = i
            let res = ''
            
            while (rem > 0)
            {
                let h = rem % 32
                res = res + abc.getSymbol(h)
                rem = (rem-h) / 32
            }

            if (q > 0)
            {
                let hash = prk
                for(let j = 0; j <= q; j++)
                {
                    tmp = hash + con_in[i] + prk   
                    hash = md.merDam_hash(tmp)
                    res = hash + res
                }  
            }
            else
            {
                tmp = prk + con_in[i] + prk       
                res = md.merDam_hash(tmp)
            }

            out[i] = res.slice(0, size_in[i])
        }
        
        return out
    }
    //прнимает символ, возвращает 1, если символ - '1', 0, если символ - '0'
    sym2bin(sym) {
        if (sym == '1') { return 1 }
        else if (sym == '0') { return 0 }
    }
    //принимает символ, возвращает 1, если символ - в алфавите, -1 иначе
    isSym(sym){
        const C = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ_"
        if ( C.includes(sym))
        {
            return 1
        }
        else
        {
            return -1
        }
    }
    //принимает строку, возвращает массив из 0 и 1, который является двоичным представлением строки
    msg2bin(msg){
        const abc = new RusABC()
        const m = msg.length
        var i = 0
        var f = 0
        const tmp = []
        var p = 0
        while (this.isSym(msg[i])==1)
        {
            p = msg[i]
            let c = abc.getKey(p)
            for (let j = 0; j < 5; j++)
            {
                if (c % 2 == 0)
                {
                    tmp[i*5+4-j] = 0
                }
                else
                {
                    tmp[i*5+4-j] = 1
                }
                c = Math.floor(c / 2)
            }
            if(i == m-1)
            {
                f = 1
                break
            }
            else
            {
                i = i + 1
            }
       
        }
        if (f == 0)
        {
            for(let k = i; k < m; k++)
            {
                p = msg[k]
                tmp[4*i+k] = this.sym2bin(p)
            }
        }
        return tmp
    }
    //принимает массив из 0 и 1, возвращает строку, которая является текстовым представлением двоичного кода
    bin2msg(bin){
        const abc = new RusABC()
        const B = bin.length
        const b = Math.floor(B / 5);
        var q = B % 5
        var out = ''
        for (let i = 0; i < b; i++)
        {
            let t = 0
            for (let j = 0; j < 5; j++)
            {
                t = 2*t + bin[5*i+j]
                
            }
            out = out + abc.getSymbol(t)
        }
        if (q > 0)
        {
            for (let k = 1; k < q; k++)
            {
                out = out + abc.getSymbol(bin[5*b+k-1])
            }
        }
        return out
    }
    //принимает набор бинарных символов,возвращает 0 или 1 и ещё вложенный массив из двух чисел)
check_padding(binmsg)
{
    var bins = binmsg
    var m = bins.length
    var blocks = Math.floor(m / 80)
    var rem = m % 80
    var f = 0
    var padlength = 0
    var numblocks = 0

    if (rem == 0)
    {
        let tb = bins.slice(m - 20, m)
        let ender = tb.slice(17, 20)
        if (ender[0] === 0 && ender[1] === 0 && ender[2] === 1)
        {
            let nb = tb.slice(7, 17)
            let pl = tb.slice(0, 7)
            for (let i = 0; i < 7; i++)
            {
                padlength = 2*padlength + pl[i]
            }
            for (let i = 0; i < 10; i++)
            {
                numblocks = 2*numblocks + nb[i]
            }
            if (numblocks == blocks && padlength >= 23 && padlength < 103)
            {
                tb = bins.slice(m - padlength, m - 20)

                if (tb[0] == 1)
                {
                    f = 1
                    for (let j = 1; j < padlength - 20; j++)
                    {
                        if (tb[j] == 1) { f = 0; break }
                    }
                }
            }
        }
    }
    return [f, [numblocks, padlength]]
}
    //добавляет подложку
    produce_padding(rem_in, blocks_in)
    {
        var b,r = 0
        const pad = []
        if(rem_in == 0)
        {
            b = blocks_in + 1
            r = 80
        }
        else if (rem_in <= 57)
        {
            r = 80 - rem_in
            b = blocks_in + 1
        }
        else
        {
            b = blocks_in + 2
            r = 160 - rem_in
        }
        pad[0] = 1
        for (let i = 1; i < r-20; i++)
        {
            pad[i] = 0
        }
        var rt = r
        for (let i = 6; i >= 0; i--)
        {
            pad[r-20+i] = rt % 2
            rt = Math.floor(rt / 2)
        }
        for (let i = 9; i >= 0; i--)
        {
            pad[r-13+i] = b % 2
            b = Math.floor(b / 2)
        }
        pad[r-3] = 0
        pad[r-2] = 0
        pad[r-1] = 1
        return pad
    }
    //на вход сообщение, на выход бинарное представление с подложкой, если она была нужна
    pad_msg(msg_in)
    {
        var pad = ""
        const bins = this.msg2bin(msg_in)
        const m = bins.length
        const blocks = Math.floor(m / 80)
        const rem = m % 80

        var f = 0
        if (rem == 0)
        {
            f = this.check_padding(bins)[0]
        }
        else
        {
            f = 1
        }

        if (f == 1)
        {
            pad = this.produce_padding(rem, blocks)
            for (let i = 0; i < pad.length; i++)
            {
                bins[m+i] = pad[i]
            }
        }
        return this.bin2msg(bins)
    }
    //на вход сообщение, на выход сообщение без подложки, если она была
    unpad_msg(msg_in)
    {
        const bins = this.msg2bin(msg_in)
        const m = bins.length
        const t = this.check_padding(bins)
        var out = []
        if (t[0] == 1)
        {
            let pl = t[1][1]
            let tmp = bins.slice(0, m - pl)
            out = this.bin2msg(tmp)
        }
        else
        {
            out = msg_in
        }
        return out
    }
    //позволяет взять одно из сообщений и один комплект ассоц.данных и скомпонировать из них текстовый пакет для передачи
    //берёт три переменные, возвращает массив из четырёх строк - data, iv, msg, mac
    prepare_packet(data, iv, msg)
    {
        var abc = new RusABC()
        iv = "________________"+iv
        msg = this.pad_msg(msg)
        const L = this.msg2bin(msg).length
        const a = ""
        for(let i = 0; i<5; i++)
        {
            a = RusABC.getSymbol(L % 32) + a
            L = Math.floor(L / 32)
        }
        data[4] = a
        mac = ""
        return [data, iv, msg, mac]
    }
    //можно игнорировать
    validate_packet(packet)
    {
        [data, iv, msg, mac] = packet
        var f = 1
        t = data[0].slice(0,1)
        s = data[0].slice(1,2)
        ml = mac.length
        if (t != "В")
        {
            f = 0
        }
        else if((s != "A" || s != "Б") ^ ml != 16)
        {
            f = 0
        }
        else if (s == "_" && ml != 0)
        {
            f = 0
        }
        return f
    }
    //принимает пакет - массив из 4 строк = data,iv,msg,mac, возвращает строку, которая является двоичным представлением пакета
    transmit(packet)
    {
        [data, iv, msg, mac] = packet
        var out = data[0]+data[1]+data[2]+data[3]+data[4]
        out = this.msg2bin(out+iv+msg+mac)
        return out
    }
    //принимает строку(поток), возвращает двумерный массив [[type, sender, receiver, session, length], iv, msg, mac]
    receive(stream)
    {
        var p = this.bin2msg(stream)
        var m = p.length
        var type = p.slice(0,2)
        var sender = p.slice(2,10)
        var receiver = p.slice(10,18)
        var session = p.slice(18,27)
        var length = p.slice(27,32)
        var iv = p.slice(32,48)
        var L = 0
        for (let i = 0; i < 5; i++)
        {
            t = length.slice[i,i+1]
            l = abc.getKey(t)
            L = 32*L + l
        }
        L = Math.floor(L / 5)
        var msg = p.slice(48, 48+L)
        var mac = p.slice(48+L, m-48-L)
        return [[type, sender, receiver, session, length], iv, msg, mac]
    }
    //принимает две 80-битовые строки, выдаёт ксор этих строк
    textor(A_IN, B_IN)
    {
        var abc = new RusABC()
        var out = ""
        for (let i = 0; i < 4; i++)
        {
            let a = A_IN.slice(i*4, i*4+4)
            let b = B_IN.slice(i*4, i*4+4)
            let A = abc.getKeyArray(a)  
            let B = abc.getKeyArray(b)  
            let C = []
            for (let j = 0; j < A.length; j++)
            {
                C[j] = A[j] ^ B[j]  
            }
            out = out + abc.getTextFromKeys(C)
        }
        return out
    }
    //Берёт на вход 5 переменных - S, H, R, C, M - и возвращает массив из 5 элементов, каждый элемент которого - массив из двух элементов - функции и константы для этих функций
    make_suite(S, H, R, C, M)
    {
        let a1, a2, a3, a4, a5

        if (S === "Caesar")
        {
            a3 = ["frw_S_CaesarM", "inv_S_CaesarM", "core_Caesar"]
        }
        else if (S === "Trithemus")
        {
            a3 = ["frw_S_TrithemusM", "inv_S_TrithemusM", "core_Trithemus"]
        }

        if (H === "Merkle-Damgard")
        {
            a5 = ["MerDam_hash", 6]
        }
        else if (H === "Sponge")
        {
            a5 = ["SpongeFun_hash", 3]
        }

        if (C === "Feistel")
        {
            a2 = [["frw_Feistel", "inv_Feistel"], 8]
        }
        else if (C === "S-P Net")
        {
            a2 = [["frw_SPNet", "inv_SPNet" ], 8]
        }

        if (R === "LCG")
        {
            a1 = ["C_CT_LCG_next", "LCG_SET"]
        }
        else if (R === "LFSR")
        {
            a1 = ["C_AS_LFSR_next", "LFSR_SET"]
        }

        if (M === "CCM")
        {
            a4 = ["CCMP_send", "CCMP_recieve"]
        }
        else if (M === "EAX")
        {
            a4 = ["EAX_CFB_send", "EAX_CFB_recieve"]
        }

        const out = [a1, a2, a3, a4, a5]
        return out
    }

}
export function consoleCheck() {
    const lab = new lab5()
    const pass1 = 'ЧЕЧЕТКА'
    const pass2 = 'АПРОЛ'
    const salt1 = 'СЕАНС'
    const salt2 = 'АТЛЕТ'
    const con = ['СЕАНСОВЫЙ_КЛЮЧ', 'КЛЮЧ_РАСПРЕДЕЛЕНИЯ_КЛЮЧЕЙ']
    const size = [32,16]

    console.log(lab.kdf(pass1, salt1, con, size, 2))
    const test = "ГНОЛЛЫ_ПИЛИЛИ_ПЫЛЕСОС_ЛОСОСЕМ"
    const textinputs = []
    // читаем файл
    const data = fs.readFileSync('app/src/logic/inp.txt', 'utf-8');
    // разбиваем на строки
    const lines = data.split('\n');
    lines.forEach((line) => {
        textinputs.push(line);
    });
    const n = textinputs[1].replace(/\r/g, '')
    console.log(n.length)
    const nter = lab.pad_msg(n)
    console.log(lab.msg2bin(nter).length)
    const tmp = lab.check_padding(lab.msg2bin(nter))
    console.log(lab.unpad_msg(nter).length)
    const a1 = "ГОЛОВКА_КРУЖИТСЯ"
    const a2 = "МЫШКА_БЫЛА_ЛИХОЙ"
    console.log(lab.textor(a1,a2))

}
consoleCheck()