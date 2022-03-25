import React from 'react';

interface DiceProps {
    points: number
}

const P_0 = 0b111110;
const P_1 = 0b111000;
const P_2 = 0b100000;
const P_3 = 0b010101;

const Dice: React.FC<DiceProps> = (props) => {
    const track = Math.pow(2, props.points);
    return (
        <div className="dice" title={`${props.points + 1}`}>
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
