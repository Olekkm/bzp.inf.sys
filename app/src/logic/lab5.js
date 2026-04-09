import { RusABC } from "./abc.js";
import { Merkl_Damgor } from "./merkl_damgor.js";
import fs from "fs";
import { SPNet } from "./SPNet.js";
export class lab5 {
    //принимает строку, строку, масив строк, массив чисел, число
    //возвращает массив строк
    kdf(mat_in, salt_in, con_in, size_in, iter_in) {
        const abc = new RusABC();
        const md = new Merkl_Damgor();
        var tmp = mat_in + salt_in;
        var out = [];
        for (let i = 0; i <= iter_in; i++) {
            let ext = md.merDam_hash(tmp);
            tmp = ext + tmp;
        }
        const prk = tmp;
        for (let i = 0; i <= size_in.length - 1; i++) {
            let q = Math.floor(size_in[i] / 64);
            let rem = i;
            let res = "";

            while (rem > 0) {
                let h = rem % 32;
                res = res + abc.getSymbol(h);
                rem = (rem - h) / 32;
            }

            if (q > 0) {
                let hash = prk;
                for (let j = 0; j <= q; j++) {
                    tmp = hash + con_in[i] + prk;
                    hash = md.merDam_hash(tmp);
                    res = hash + res;
                }
            } else {
                tmp = prk + con_in[i] + prk;
                res = md.merDam_hash(tmp);
            }

            out[i] = res.slice(0, size_in[i]);
        }

        return out;
    }
    //прнимает символ, возвращает 1, если символ - '1', 0, если символ - '0'
    sym2bin(sym) {
        if (sym == "1") {
            return 1;
        } else if (sym == "0") {
            return 0;
        }
    }
    //принимает символ, возвращает 1, если символ - в алфавите, -1 иначе
    isSym(sym) {
        const C = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ_";
        if (C.includes(sym)) {
            return 1;
        } else {
            return -1;
        }
    }
    //принимает строку, возвращает массив из 0 и 1, который является двоичным представлением строки
    msg2bin(msg) {
        const abc = new RusABC();
        const m = msg.length;
        var i = 0;
        var f = 0;
        const tmp = [];
        var p = 0;
        while (this.isSym(msg[i]) == 1) {
            p = msg[i];
            let c = abc.getKey(p);
            for (let j = 0; j < 5; j++) {
                if (c % 2 == 0) {
                    tmp[i * 5 + 4 - j] = 0;
                } else {
                    tmp[i * 5 + 4 - j] = 1;
                }
                c = Math.floor(c / 2);
            }
            if (i == m - 1) {
                f = 1;
                break;
            } else {
                i = i + 1;
            }
        }
        if (f == 0) {
            for (let k = i; k < m; k++) {
                p = msg[k];
                tmp[4 * i + k] = this.sym2bin(p);
            }
        }
        return tmp;
    }
    //принимает массив из 0 и 1, возвращает строку, которая является текстовым представлением двоичного кода
    bin2msg(bin) {
        const abc = new RusABC();
        const B = bin.length;
        const b = Math.floor(B / 5);
        var q = B % 5;
        var out = "";
        for (let i = 0; i < b; i++) {
            let t = 0;
            for (let j = 0; j < 5; j++) {
                t = 2 * t + bin[5 * i + j];
            }
            out = out + abc.getSymbol(t);
        }
        if (q > 0) {
            for (let k = 1; k < q; k++) {
                out = out + abc.getSymbol(bin[5 * b + k - 1]);
            }
        }
        return out;
    }
    //принимает набор бинарных символов,возвращает 0 или 1 и ещё вложенный массив из двух чисел)
    check_padding(binmsg) {
        var bins = binmsg;
        var m = bins.length;
        var blocks = Math.floor(m / 80);
        var rem = m % 80;
        var f = 0;
        var padlength = 0;
        var numblocks = 0;

        if (rem == 0) {
            let tb = bins.slice(m - 20, m);
            let ender = tb.slice(17, 20);
            if (ender[0] === 0 && ender[1] === 0 && ender[2] === 1) {
                let nb = tb.slice(7, 17);
                let pl = tb.slice(0, 7);
                for (let i = 0; i < 7; i++) {
                    padlength = 2 * padlength + pl[i];
                }
                for (let i = 0; i < 10; i++) {
                    numblocks = 2 * numblocks + nb[i];
                }
                if (numblocks == blocks && padlength >= 23 && padlength < 103) {
                    tb = bins.slice(m - padlength, m - 20);

                    if (tb[0] == 1) {
                        f = 1;
                        for (let j = 1; j < padlength - 20; j++) {
                            if (tb[j] == 1) {
                                f = 0;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return [f, [numblocks, padlength]];
    }
    //добавляет подложку
    produce_padding(rem_in, blocks_in) {
        var b,
            r = 0;
        const pad = [];
        if (rem_in == 0) {
            b = blocks_in + 1;
            r = 80;
        } else if (rem_in <= 57) {
            r = 80 - rem_in;
            b = blocks_in + 1;
        } else {
            b = blocks_in + 2;
            r = 160 - rem_in;
        }
        pad[0] = 1;
        for (let i = 1; i < r - 20; i++) {
            pad[i] = 0;
        }
        var rt = r;
        for (let i = 6; i >= 0; i--) {
            pad[r - 20 + i] = rt % 2;
            rt = Math.floor(rt / 2);
        }
        for (let i = 9; i >= 0; i--) {
            pad[r - 13 + i] = b % 2;
            b = Math.floor(b / 2);
        }
        pad[r - 3] = 0;
        pad[r - 2] = 0;
        pad[r - 1] = 1;
        return pad;
    }
    //на вход сообщение, на выход бинарное представление с подложкой, если она была нужна
    pad_msg(msg_in) {
        var pad = "";
        const bins = this.msg2bin(msg_in);
        const m = bins.length;
        const blocks = Math.floor(m / 80);
        const rem = m % 80;

        var f = 0;
        if (rem == 0) {
            f = this.check_padding(bins)[0];
        } else {
            f = 1;
        }

        if (f == 1) {
            pad = this.produce_padding(rem, blocks);
            for (let i = 0; i < pad.length; i++) {
                bins[m + i] = pad[i];
            }
        }
        return this.bin2msg(bins);
    }
    //на вход сообщение, на выход сообщение без подложки, если она была
    unpad_msg(msg_in) {
        const bins = this.msg2bin(msg_in);
        const m = bins.length;
        const t = this.check_padding(bins);
        var out = [];
        if (t[0] == 1) {
            let pl = t[1][1];
            let tmp = bins.slice(0, m - pl);
            out = this.bin2msg(tmp);
        } else {
            out = msg_in;
        }
        return out;
    }
    //позволяет взять одно из сообщений и один комплект ассоц.данных и скомпонировать из них текстовый пакет для передачи
    //берёт три переменные, возвращает массив из четырёх строк - data, iv, msg, mac
    prepare_packet(data, iv, msg) {
        var abc = new RusABC();
        iv = "________________" + iv;
        msg = this.pad_msg(msg);
        const L = this.msg2bin(msg).length;
        const a = "";
        for (let i = 0; i < 5; i++) {
            a = RusABC.getSymbol(L % 32) + a;
            L = Math.floor(L / 32);
        }
        data[4] = a;
        mac = "";
        return [data, iv, msg, mac];
    }
    //можно игнорировать
    validate_packet(packet) {
        [data, iv, msg, mac] = packet;
        var f = 1;
        t = data[0].slice(0, 1);
        s = data[0].slice(1, 2);
        ml = mac.length;
        if (t != "В") {
            f = 0;
        } else if ((s != "A" || s != "Б") ^ (ml != 16)) {
            f = 0;
        } else if (s == "_" && ml != 0) {
            f = 0;
        }
        return f;
    }
    //принимает пакет - массив из 4 строк = data,iv,msg,mac, возвращает строку, которая является двоичным представлением пакета
    transmit(packet) {
        [data, iv, msg, mac] = packet;
        var out = data[0] + data[1] + data[2] + data[3] + data[4];
        out = this.msg2bin(out + iv + msg + mac);
        return out;
    }
    //принимает строку(поток), возвращает двумерный массив [[type, sender, receiver, session, length], iv, msg, mac]
    receive(stream) {
        var p = this.bin2msg(stream);
        var m = p.length;
        var type = p.slice(0, 2);
        var sender = p.slice(2, 10);
        var receiver = p.slice(10, 18);
        var session = p.slice(18, 27);
        var length = p.slice(27, 32);
        var iv = p.slice(32, 48);
        var L = 0;
        for (let i = 0; i < 5; i++) {
            t = length.slice[(i, i + 1)];
            l = abc.getKey(t);
            L = 32 * L + l;
        }
        L = Math.floor(L / 5);
        var msg = p.slice(48, 48 + L);
        var mac = p.slice(48 + L, m - 48 - L);
        return [[type, sender, receiver, session, length], iv, msg, mac];
    }
    //принимает две 80-битовые строки, выдаёт ксор этих строк
    textor(A_IN, B_IN) {
        var abc = new RusABC();
        var out = "";
        for (let i = 0; i < 4; i++) {
            let a = A_IN.slice(i * 4, i * 4 + 4);
            let b = B_IN.slice(i * 4, i * 4 + 4);
            let A = abc.getKeyArray(a);
            let B = abc.getKeyArray(b);
            let C = [];
            for (let j = 0; j < A.length; j++) {
                C[j] = A[j] ^ B[j];
            }
            out = out + abc.getTextFromKeys(C);
        }
        return out;
    }
    //Берёт на вход 5 переменных - S, H, R, C, M - и возвращает массив из 5 элементов, каждый элемент которого - массив из двух элементов - функции и константы для этих функций
    make_suite() {
        let a1, a2, a3, a4, a5;

        a3 = ["frw_S_CaesarM", "inv_S_CaesarM", "core_Caesar"];

        a5 = ["MerDam_hash", 6];

        a2 = [["frw_SPNet", "inv_SPNet"], 8];

        a1 = ["C_AS_LFSR_next", "LFSR_SET"];

        a4 = ["EAX_CFB_send", "EAX_CFB_recieve"];

        const out = [a1, a2, a3, a4, a5];
        return out;
    }

    frw_CFB(messageInput, ivInput, keyInput, macInput) {
        if (![-1, 0, 1].includes(macInput)) {
            throw new Error("mac input should be on of (-1, 0, 1)");
        }

        const R = 8;
        let feedback = ivInput;
        let out = "";
        let cont = "________________";

        const spNet = new SPNet();

        for (let i = 0; i < Math.trunc(messageInput.length) / 16; i++) {
            const inp = messageInput.substring(i * 16, i * 16 + 16);
            cont = this.textor(inp, cont);
            const keystream = spNet.frw_SPNet(feedback, keyInput, R);
            feedback = this.textor(inp, keystream);
            out = out + feedback;
        }

        const keystream = spNet.frw_SPNet(feedback, keyInput, R);
        const mac = this.textor(cont, keystream);

        switch (macInput) {
            case 0:
                return out;
                break;
            case 1:
                return out + mac;
                break;
            case -1:
                return mac;
                break;
            default:
                throw new Error("error in macInput value (switch-case block)");
                break;
        }
    }

    inv_CFB(messageInput, ivInput, keyInput, macInput) {
        if (!(typeof macInput == "number")) {
            throw new Error("mac input should a number");
        }

        const R = 8;
        const m = Math.trunc(messageInput.length) / 16;
        let feedback = ivInput;
        let out = "";
        let cont = "________________";

        const spNet = new SPNet();

        for (let i = 0; i < m - macInput; i++) {
            const inp = messageInput.substring(i * 16, i * 16 + 16);
            const keystream = spNet.frw_SPNet(feedback, keyInput, R);
            feedback = inp;
            const text = this.textor(inp, keystream);
            cont = this.textor(cont, text);

            out = out + text;
        }

        if (macInput === 0) {
            return out;
        }

        const mac = messageInput.substring((m - 1) * 16, m * 16);
        const keystream = spNet.frw_SPNet(feedback, keyInput, R);
        const text = this.textor(mac, keystream);
        cont = this.textor(cont, text);

        if (macInput === 1) {
            return out + cont;
        } else {
            return cont;
        }
    }

    EAX_CFB_frw(packetInput, cmacInput, keyInput, secInput, onlymac) {
        let [assdataInput, ivInput, messageInput, tmp] = packetInput;

        tmp = assdataInput[0] + assdataInput[3] + assdataInput[4];

        const civ = this.frw_CFB(secInput + tmp, ivInput, keyInput, -1);

        if (onlymac === 1) {
            tmp = this.frw_CFB(messageInput, civ, keyInput, -1);
            const MAC = this.textor(this.textor(tmp, civ), cmacInput);
            const MSG = messageInput;

            return [assdataInput, ivInput, MSG, MAC];
        } else {
            tmp = this.frw_CFB(messageInput, civ, keyInput, 1);
            const m = tmp.substring(
                messageInput.length,
                messageInput.length + 16,
            );
            const MAC = this.textor(this.textor(m, civ), cmacInput);
            const MSG = tmp.substring(0, messageInput.length);

            return [assdataInput, ivInput, MSG, MAC];
        }
    }

    EAX_CFB_inv(packetInput, keyInput, secInput, onlymac) {
        const [adInput, ivInput, messageInput, macInput] = packetInput;

        let temp = adInput[0] + adInput[3] + adInput[4];
        const data =
            adInput[0] + adInput[1] + adInput[2] + adInput[3] + "_____";
        const cmac = this.frw_CFB(data, secInput, keyInput, -1);

        const civ = this.frw_CFB(secInput + temp, ivInput, keyInput, -1);

        if (onlymac === 1) {
            temp = this.frw_CFB(messageInput, civ, keyInput, -1);
            const MAC = this.textor(
                macInput,
                this.textor(this.textor(temp, civ), cmac),
            );
            const MSG = messageInput;
            return [adInput, ivInput, MSG, MAC];
        } else {
            const cont = this.textor(this.textor(macInput, civ), cmac);
            temp = this.inv_CFB(messageInput + cont, civ, keyInput, 1);
            const MAC = temp.substring(
                messageInput.length,
                messageInput.length + 16,
            );
            const MSG = temp.substring(0, messageInput.length);
            return [adInput, ivInput, MSG, MAC];
        }
    }
}
export function consoleCheck() {
    const lab = new lab5();

    const str =
        "ГАРРИ_С_ОТКРЫТЫМ_РТОМ_СМОТРЕЛ_НА_СЕМЕЙНОЕ_ХРАНИЛИЩЕ_ТЧК_У_НЕГО_БЫЛО_ТАК_МНОГО_ВОПРОСОВ_ЗПТ_ЧТО_ОН_ДАЖЕ_НЕ_ЗНАЛ_ЗПТ_С_КАКОГО_ИМЕННО_НАЧАТЬ_ТЧК_МАКГОНАГАЛЛ_СТОЯЛА_У_ДВЕРИ_И_НАБЛЮДАЛА_ЗА_МАЛЬЧИКОМ_ТЧК_ОНА_НЕБРЕЖНО_ОПИРАЛАСЬ_О_СТЕНУ_ЗПТ_НО_ВЗГЛЯД_У_НЕЕ_БЫЛ_НАПРЯЖЕННЫЙ_ТЧК_И_НЕСПРОСТА_ТЧК_ОКАЗАТЬСЯ_ПЕРЕД_ОГРОМНОЙ_КУЧЕЙ_ЗОЛОТЫХ_МОНЕТ_ТИРЕ_ТА_ЕЩЕ_ПРОВЕРКА_НА_ПРОЧНОСТЬ_ТЧК_";

    const keys = [
        "ОННТЦРХФЙФМРИРАК",
        "ЖЛЬГИЗФХЗМЩХМРЛО",
        "ПЛПХВЛЕГЙСЕВЯГМЛ",
        "ТТХАОПСЫНЕЦОХЫДЛ",
        "ЩЯЩЬЛАГЧЬФПЙЗЗЧГ",
        "ЗГГСРСШ_НЮЖДТАЫЙ",
        "МЩГХИШКЖРЯЩВККТГ",
        "ЫЙАННЦУЖДЬСГДУШН",
    ];

    const iv1 = "АЛИСА_УМЕЕТ_ПЕТЬ";

    const AD = ["ВБ", "АЛИСА_АЖ", "БОБ___ОЧ", "ЕГИПТЯНИН", "АБВГД"];
    const packet = [AD, "БОБ_НЕМНОГО_ПЬЯН", str, ""];
    const cadInput = "ПОКА_ЕЩЕ_НЕВАЖНО";
    const secInput = "ТОЖЕ_ЕЩЕ_НЕВАЖНО";
    const cad = AD[0] + AD[1] + AD[2] + AD[3] + "_____";
    const cadmac = lab.frw_CFB(cad, secInput, keys, -1);

    const frw = lab.EAX_CFB_frw(packet, cadmac, keys, secInput, 0);
    console.log(frw);
    console.log(lab.EAX_CFB_inv(frw, keys, secInput, 0));

    // const pass1 = "ЧЕЧЕТКА";
    // const pass2 = "АПРОЛ";
    // const salt1 = "СЕАНС";
    // const salt2 = "АТЛЕТ";
    // const con = ["СЕАНСОВЫЙ_КЛЮЧ", "КЛЮЧ_РАСПРЕДЕЛЕНИЯ_КЛЮЧЕЙ"];
    // const size = [32, 16];

    // console.log(lab.kdf(pass1, salt1, con, size, 2));
    // const test = "ГНОЛЛЫ_ПИЛИЛИ_ПЫЛЕСОС_ЛОСОСЕМ";
    // const textinputs = [];
    // // читаем файл
    // const data = fs.readFileSync("app/src/logic/inp.txt", "utf-8");
    // // разбиваем на строки
    // const lines = data.split("\n");
    // lines.forEach((line) => {
    //     textinputs.push(line);
    // });
    // const n = textinputs[1].replace(/\r/g, "");
    // console.log(n.length);
    // const nter = lab.pad_msg(n);
    // console.log(lab.msg2bin(nter).length);
    // const tmp = lab.check_padding(lab.msg2bin(nter));
    // console.log(lab.unpad_msg(nter).length);
    // const a1 = "ГОЛОВКА_КРУЖИТСЯ";
    // const a2 = "МЫШКА_БЫЛА_ЛИХОЙ";
    // console.log(lab.textor(a1, a2));
}
