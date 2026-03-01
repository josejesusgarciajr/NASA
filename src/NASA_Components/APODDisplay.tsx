import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import type { APOD } from '../types/NASA/APOD'

type APODDisplayProps = {
    apod: APOD;
}

export const APODDisplay = ({apod} : APODDisplayProps) => {
    const video = apod.media_type === 'video';
    console.log(apod.url);

    return (
        <>
            <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
            <p style={{ textAlign: 'center' }}>{apod.title}</p>
            <p style={{ textAlign: 'center' }}>{apod.date}</p>
            { video ? (
                <video src={apod.url} controls width='100%'/>
            ) : (
                <img src={apod.hdurl} alt={apod.title}
                    style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'block' }} 
                    className="apod-image" />
            )}
            <br />
            <p style={{
                textAlign: 'center',
                maxWidth: '100%',
                margin: '0 auto',
                padding: '0'
            }}>
                {apod.explanation}
            </p>
        </>
    );
}