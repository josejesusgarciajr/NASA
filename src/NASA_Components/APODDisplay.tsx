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
            <img src={apod.hdurl} width={800} />
            <br />
            {apod.explanation}
        </>
    );
}