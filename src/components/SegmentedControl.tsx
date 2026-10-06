import {useRef, type KeyboardEvent} from 'react';

interface SegmentedControlProps<T extends string> {
    label: string;
    value: T;
    options: {value: T, label: string}[];
    onChange: (value: T) => void;
}

// Arrow keys move selection like native radios; only the checked option is a tab stop
const KEY_STEPS: Record<string, number> = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1};

const SegmentedControl = <T extends string>({label, value, options, onChange}: SegmentedControlProps<T>) => {
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);

    const select = (index: number) => {
        onChange(options[index].value);
        buttons.current[index]?.focus();
    };

    const onKeyDown = (event: KeyboardEvent, index: number) => {
        const last = options.length - 1;
        if (event.key in KEY_STEPS) select((index + KEY_STEPS[event.key] + options.length) % options.length);
        else if (event.key === 'Home') select(0);
        else if (event.key === 'End') select(last);
        else return;
        event.preventDefault();
    };

    return (
        <div className="segmented" role="radiogroup" aria-label={label}>
            {options.map((option, index) => (
                <button
                    key={option.value}
                    ref={element => {
                        buttons.current[index] = element;
                    }}
                    type="button"
                    className={`segmented__option${option.value === value ? ' segmented__option--active' : ''}`}
                    role="radio"
                    aria-checked={option.value === value}
                    tabIndex={option.value === value ? 0 : -1}
                    onClick={() => onChange(option.value)}
                    onKeyDown={event => onKeyDown(event, index)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default SegmentedControl;
