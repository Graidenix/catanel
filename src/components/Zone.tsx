const size = 14;

type ResourceType = 'empty' | 'iron' | 'clay' | 'wood' | 'wool' | 'wheat';

const zonePos = ({x,y}: {x: number, y: number}): {top: string, left: string} => {
    return {
        top: 6.5 + y * size * 0.83 + 'vmin',
        left: 3.4 + ((y % 2 ? 0.5 : 0) + x) * size + 'vmin'
    }
}

function Zone(props: React.PropsWithChildren<{x: number, y: number, resource: ResourceType}>) {
    return ( 
        <div className={`zone zone--${props.resource}`} style={zonePos(props)} />
     );
}

export default Zone;
