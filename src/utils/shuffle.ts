const shuffle = <T>(list: T[]): T[] => list
    .map(value => ({value, weight: Math.random()}))
    .sort((a, b) => a.weight - b.weight)
    .map(i => i.value);

export default shuffle;
