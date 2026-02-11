export default function VigenereSelector({ cypherer }) {
    return (
        <select style={{ border: "1px solid black" }} onChange={(e) => cypherer.setEncoder(e.target.value)}>
            <option value={"BaseVigenere"}>Базовый шифр Виженера</option>
            <option value={"S_Block"}>Простой S-блок</option>
            <option value={"Merge_Block"}>Перемешивание символов</option>
            <option value={"S_Block_Mod"}>Усложненный S-блок</option>
        </select>)
}