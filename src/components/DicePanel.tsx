import Dice from './Dice';
import {diceSum, type DicePair} from '../utils/dice';
import {HISTORY_SIZE} from '../hooks/useDiceRoll';
import {ROBBER_ROLL} from '../utils/constants';

interface DicePanelProps {
    dice: DicePair;
    rolling: boolean;
    history: {id: number, dice: DicePair}[];
    onRoll: () => void;
}

const DicePanel = ({dice, rolling, history, onRoll}: DicePanelProps) => {
    const sum = diceSum(dice);
    const robber = !rolling && sum === ROBBER_ROLL;
    return (
        <section className="panel">
            <h2 className="panel__title">Dice</h2>
            <div className="dices">
                <Dice points={dice[0]} rolling={rolling}/>
                <Dice points={dice[1]} rolling={rolling}/>
            </div>
            <div className={`sum${robber ? ' sum--robber' : ''}`}>
                <span className="sum__value">{rolling ? '…' : sum}</span>
                <span className="sum__label">{robber ? 'Robber moves!' : 'total'}</span>
            </div>
            <button className="button button--primary" onClick={onRoll} disabled={rolling}>
                {rolling ? 'Rolling…' : 'Roll dice'}
            </button>
            <h3 className="panel__subtitle">History</h3>
            {/* Fixed number of slots so the panel keeps its height before the first roll */}
            <ol className="history" aria-label="Last rolls">
                {history.map(entry => (
                    <li key={entry.id} className="history__item">{diceSum(entry.dice)}</li>
                ))}
                {Array.from({length: HISTORY_SIZE - history.length}, (_, i) => (
                    <li key={`empty-${i}`} className="history__item history__item--empty" aria-hidden="true"/>
                ))}
            </ol>
        </section>
    );
};

export default DicePanel;
