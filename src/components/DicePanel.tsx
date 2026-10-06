import {Eraser} from 'lucide-react';
import Dice from './Dice';
import {diceSum, type DicePair} from '../utils/dice';
import {HISTORY_SIZE} from '../hooks/useDiceRoll';
import {ROBBER_ROLL} from '../utils/constants';

interface DicePanelProps {
    dice: DicePair | null;
    rolling: boolean;
    history: {id: number, dice: DicePair}[];
    onRoll: () => void;
    onClear: () => void;
}

const DicePanel = ({dice, rolling, history, onRoll, onClear}: DicePanelProps) => {
    const sum = dice && diceSum(dice);
    const robber = !rolling && sum === ROBBER_ROLL;
    // Announce only settled rolls; a fresh key per roll makes repeated totals re-announce
    const latest = history[0];
    const announcement = !rolling && dice !== null && latest
        ? `Rolled ${sum}${robber ? ', robber moves' : ''}`
        : null;
    return (
        <section className="panel">
            <h2 className="panel__title">Dice</h2>
            <p className="sr-only" role="status" aria-live="polite">
                {announcement && <span key={latest!.id}>{announcement}</span>}
            </p>
            <div className="dices">
                <Dice points={dice?.[0] ?? null} rolling={rolling}/>
                <Dice points={dice?.[1] ?? null} rolling={rolling}/>
            </div>
            <div className={`sum${robber ? ' sum--robber' : ''}`}>
                <span className="sum__value">{rolling ? '…' : sum ?? '–'}</span>
                <span className="sum__label">
                    {robber ? (
                        <>
                            {/* Phones show the short form; the full text stays available to screen readers */}
                            <span className="sum__label-long">Robber moves!</span>
                            <span className="sum__label-short" aria-hidden="true">Robber!</span>
                        </>
                    ) : 'total'}
                </span>
            </div>
            <div className="panel__actions">
                <button className="button button--primary" onClick={onRoll} disabled={rolling}>
                    {rolling ? 'Rolling…' : 'Roll dice'}
                </button>
                <button
                    className="button button--clear"
                    onClick={onClear}
                    disabled={rolling || dice === null}
                    aria-label="Clear dice"
                    title="Clear dice"
                >
                    <Eraser size={18} aria-hidden="true"/>
                </button>
            </div>
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
