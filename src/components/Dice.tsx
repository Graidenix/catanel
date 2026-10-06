const P_0 = 0b111110;
const P_1 = 0b111000;
const P_2 = 0b100000;
const P_3 = 0b010101;

interface DiceProps {
    points: number;
    rolling?: boolean;
    small?: boolean;
}

const Dice = ({points, rolling = false, small = false}: DiceProps) => {
    const track = Math.pow(2, points);
    const className = ['dice', rolling && 'dice--rolling', small && 'dice--small'].filter(Boolean).join(' ');
    return (
        <div className={className} title={`${points + 1}`}>
            <div className="dice__point" data-on={P_0 & track}/>
            <div className="dice__point" data-on={0}/>
            <div className="dice__point" data-on={P_1 & track}/>
            <div className="dice__point" data-on={P_2 & track}/>
            <div className="dice__point" data-on={P_3 & track}/>
            <div className="dice__point" data-on={P_2 & track}/>
            <div className="dice__point" data-on={P_1 & track}/>
            <div className="dice__point" data-on={0}/>
            <div className="dice__point" data-on={P_0 & track}/>
        </div>
    );
};

export default Dice;
