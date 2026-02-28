import { useState, cloneElement } from "react"

export default function CyphererTester({ cypherer, style, componentLabel, children }) {
    const [plainText, setPlainText] = useState("")
    const [keyword, setKeyword] = useState("")
    const [coded, setCoded] = useState("")

    const [decodeKeyword, setDecodeKeyword] = useState("")
    const [decoded, setDecoded] = useState("")

    return (
        <div style={style}><h2>{componentLabel}</h2>
            <br />
            {children == undefined ? undefined : cloneElement(children, { cypherer: cypherer })}
            <div style={{ minHeight: "3rem" }}>
                <input type="text" style={{ border: "1px solid black" }}
                    placeholder="Текст" value={plainText} onChange={(e) => setPlainText(e.target.value)} />
                <input type="text" style={{ border: "1px solid black", marginLeft: "2rem" }}
                    placeholder="Ключ для шифрования" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <button style={{ border: "1px solid black" }} onClick={() => setCoded(cypherer.Encode(plainText, keyword))}>Зашифровать</button>
                <p>{coded}</p>
            </div>
            <div>
                <input type="text" style={{ border: "1px solid black" }}
                    placeholder="Ключ для расшифровки" value={decodeKeyword} onChange={(e) => setDecodeKeyword(e.target.value)} />
                <button style={{ border: "1px solid black" }} onClick={() => setDecoded(cypherer.Decode(coded, decodeKeyword))}>Расшифровать</button>
                <p>{decoded}</p>
            </div>
        </div>)
}