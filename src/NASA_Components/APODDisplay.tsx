import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import type { APOD } from '../types/NASA/APOD'

type APODDisplayProps = {
    apod: APOD;
}

export const APODDisplay = ({apod} : APODDisplayProps) => {
    return (
        <>
            <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
            <p>{apod.title}</p>
            <p>{apod.date}</p>
            <img src={apod.hdurl} alt={apod.title}
                style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }} 
                className="apod-image" />
            <br />
            {apod.explanation}
        </>
    );
}