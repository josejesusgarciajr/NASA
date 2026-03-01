import { NASAServiceDisplay } from '../NASA_Components/NASAServiceDisplay'
import type { APOD } from '../types/NASA/APOD'
import { useRef, useEffect } from 'react'

type APODDisplayProps = {
    apod: APOD;
}

export const APODDisplay = ({apod} : APODDisplayProps) => {
    const video = apod.media_type === 'video';
    const secureVideoLink = apod.url?.replace('http://', 'https://');
    const secureImageLink = apod.hdurl?.replace('http://', 'https://');
    const videoRef = useRef<HTMLVideoElement>(null);

    // play video on app mount
    useEffect(() => {
        if (video && videoRef.current) {
            videoRef.current.play();
        }
    }, [apod]);

    return (
        <>
            <NASAServiceDisplay serviceAcronym='APOD' serviceName='Astronomy Picture of the Day' />
            <p style={{ textAlign: 'center' }}>{apod.title}</p>
            <p style={{ textAlign: 'center' }}>{apod.date}</p>
            { video ? (
                <video ref={videoRef} src={secureVideoLink} controls width='100%' muted autoPlay playsInline />
            ) : (
                <img src={secureImageLink} alt={apod.title}
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