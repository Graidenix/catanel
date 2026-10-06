import {BOARD_CONFIGS, PLAYER_MODES, type PlayerMode} from '../utils/constants';

interface PlayerModeToggleProps {
    value: PlayerMode;
    onChange: (mode: PlayerMode) => void;
}

const PlayerModeToggle = ({value, onChange}: PlayerModeToggleProps) => (
    <div className="segmented" role="radiogroup" aria-label="Number of players">
        {PLAYER_MODES.map(mode => (
            <button
                key={mode}
                className={`segmented__option${mode === value ? ' segmented__option--active' : ''}`}
                role="radio"
                aria-checked={mode === value}
                onClick={() => onChange(mode)}
            >
                {BOARD_CONFIGS[mode].label}
            </button>
        ))}
    </div>
);

export default PlayerModeToggle;
