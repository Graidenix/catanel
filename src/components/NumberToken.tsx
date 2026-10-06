import {HOT_NUMBERS} from '../utils/constants';

const NumberToken = ({value}: {value: number}) => {
    const hot = HOT_NUMBERS.includes(value);
    return (
        <div className={`token${hot ? ' token--hot' : ''}`}>
            <span className="token__value">{value}</span>
        </div>
    );
};

export default NumberToken;
