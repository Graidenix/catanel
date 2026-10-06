import {useEffect, useState} from 'react';

const matches = (query: string): boolean =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;

const useMediaQuery = (query: string): boolean => {
    const [match, setMatch] = useState(() => matches(query));

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        const list = window.matchMedia(query);
        const onChange = () => setMatch(list.matches);
        onChange();
        list.addEventListener('change', onChange);
        return () => list.removeEventListener('change', onChange);
    }, [query]);

    return match;
};

export default useMediaQuery;
