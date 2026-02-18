import { useState } from "react"
import { OneWayCypherer } from "../logic/оneWayCypherer.js"

export default function CBlockTester({ style }) {
    const id = [0, 1, 2, 3]
    const [, setInput] = useState(["", "", "", ""])
    const [encoded, setEncoded] = useState("")
    const [outSize, setOutSize] = useState(4)


    function encode(dataArr) {
        const encoder = new OneWayCypherer()
        const encoded = encoder.cBlock(dataArr, parseInt(outSize))
        setEncoded(encoded)
    }

    function handleClick() {
        const inputsArr = []
        for (let i of id) {
            inputsArr.push(document.getElementById(i).value)
        }
        setInput(inputsArr)

        const calcArr = inputsArr.filter((elem) => elem != "")
        //console.log(calcArr)
        encode(calcArr)
    }

    return (
        <div style={{ paddingLeft: "1rem", ...style }}><h2>C-block</h2>
            <br />
            <div style={{ minHeight: "3rem", display: "inline-block" }}>
                {id.map(id => <input key={id} id={id}
                    placeholder={`Значение №${id + 1}`}
                    style={{ border: "1px solid black", display: "block", marginBottom: "0.5rem" }}
                ></input>)}
                <button style={{ border: "1px solid black" }}
                    onClick={handleClick}>Зашифровать</button>
            </div>
            <div style={{ minHeight: "3rem", display: "inline-block", paddingLeft: "2rem" }}>
                <label htmlFor="outSize">Размер сжатия </label>
                <select value={outSize} id="outSize" style={{ border: "1px solid black", marginBottom: "1rem" }}
                    onChange={(e) => (setOutSize(e.target.value))}>
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                </select>
                <p>Зашифрованное значение:</p>
                <p>{encoded ? encoded : "Ожидаем..."}</p>
            </div>
        </div >)
}