const shuffle = <T>(list: T[]): T[] => list
    .map(value => ({value, weight: Math.random()}))
    .toSorted((a, b) => a.weight - b.weight)
    .map(i => i.value);

export default shuffle;
