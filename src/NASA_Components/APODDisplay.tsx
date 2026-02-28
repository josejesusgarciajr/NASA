import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import type { APOD } from '../types/NASA/APOD'

type APODDisplayProps = {
    apod: APOD;
}

export const APODDisplay = ({apod} : APODDisplayProps) => {
    return (
        <>
            <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
            <p style={{ textAlign: 'center' }}>{apod.title}</p>
            <p style={{ textAlign: 'center' }}>{apod.date}</p>
            <img src={apod.hdurl} alt={apod.title}
                style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'block' }} 
                className="apod-image" />
            <br />
            <p style={{
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto',
                padding: '0 1rem'
            }}>
                {apod.explanation}
            </p>
        </>
    );
}