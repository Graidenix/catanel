import React, {useEffect, useState} from 'react';
import Island from './components/Island';
import Dice from "./components/Dice";

const rollDice = (): [number, number] => {
    const d1 = Math.floor(Math.random() * 6);
    const d2 = Math.floor(Math.random() * 6);
    return [d1, d2];
};

function App() {
    const [dices, setDices] = useState([0, 0]);

    useEffect(() => {
        setDices(rollDice());
    }, []);

    const rollDiceHandler = () => {
        setDices(rollDice());
    }

    return (
        <>
            <Island/>
            <div className="dices" onClick={rollDiceHandler}>
                <Dice points={dices[0]}/>
                <Dice points={dices[1]}/>
            </div>
        </>
    );
}

export default App;
