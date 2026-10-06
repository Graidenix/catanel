import {useState} from 'react';
import {Settings as SettingsIcon} from 'lucide-react';
import Board from './components/Board';
import DicePanel from './components/DicePanel';
import Ocean from './components/Ocean';
import SettingsDialog from './components/SettingsDialog';
import useBoard from './hooks/useBoard';
import useDiceRoll from './hooks/useDiceRoll';
import useSettings, {type Settings} from './hooks/useSettings';
import {diceSum} from './utils/dice';

const App = () => {
    const {settings, updateSettings} = useSettings();
    const {tiles, regenerate} = useBoard({mode: settings.mode, balance: settings.balance});
    const [settingsOpen, setSettingsOpen] = useState(false);
    const {dice, rolling, history, roll, clear} = useDiceRoll();
    const rolled = !settings.showDice || rolling || dice === null ? null : diceSum(dice);

    const changeSettings = (patch: Partial<Settings>) => {
        const next = {...settings, ...patch};
        if (next.mode !== settings.mode || next.balance !== settings.balance) {
            regenerate({mode: next.mode, balance: next.balance});
        }
        updateSettings(patch);
    };

    return (
        <div className="app">
            <Ocean/>
            <header className="header">
                <div className="header__brand">
                    <h1 className="header__title">Catanel</h1>
                    <p className="header__tagline">Random Catan board generator &amp; dice roller</p>
                </div>
                <div className="header__actions">
                    {settings.showMap && (
                        <button className="button" onClick={() => regenerate({mode: settings.mode, balance: settings.balance})}>New map</button>
                    )}
                    <button
                        className="button button--settings"
                        onClick={() => setSettingsOpen(true)}
                        aria-haspopup="dialog"
                        aria-label="Settings"
                    >
                        <SettingsIcon className="button__icon" size={18} aria-hidden="true"/>
                        <span className="button__label">Settings</span>
                    </button>
                </div>
            </header>
            <main className="layout">
                {settings.showMap && (
                    <div className="board-area">
                        <Board mode={settings.mode} tiles={tiles} rolled={rolled} showTokens={settings.showTokens}/>
                    </div>
                )}
                {settings.showDice && (
                    <DicePanel dice={dice} rolling={rolling} history={history} onRoll={roll} onClear={clear}/>
                )}
            </main>
            <SettingsDialog
                open={settingsOpen}
                settings={settings}
                onChange={changeSettings}
                onClose={() => setSettingsOpen(false)}
            />
        </div>
    );
};

export default App;
