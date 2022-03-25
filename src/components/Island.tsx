import Zone from "./Zone";

const available = [
    'empty',
    ...Array(3).fill('iron'),
    ...Array(3).fill('clay'),
    ...Array(4).fill('wood'),
    ...Array(4).fill('wool'),
    ...Array(4).fill('wheat'),
];

function shuffle<T>(list: T[]): T[] {
    return list
        .map(value => ({value, weight: Math.random()}))
        .sort((a, b) => a.weight - b.weight)
        .map(i => i.value);
}

const zones = shuffle(available).map((resource, i) => {
    if (i < 3) return {y: 0, x: i + 1, i, resource};
    if (i < 7) return {y: 1, x: i - 3, i, resource};
    if (i < 12) return {y: 2, x: i - 7, i, resource};
    if (i < 16) return {y: 3, x: i - 12, i, resource};
    return {y: 4, x: i - 15, i, resource};
});

function Island() {
    return (
        <div className="island">
            {zones.map(zone => (<Zone key={zone.i} resource={zone.resource} x={zone.x} y={zone.y}/>))}
        </div>
    );
}

export default Island;