import type { APOD } from '../types/NASA/APOD'
import { useRef, useEffect } from 'react'

type APODDisplayProps = {
    apod: APOD;
    setImageLoaded: (imageLoad: boolean) => void;
}

export const APODDisplay = ({apod, setImageLoaded} : APODDisplayProps) => {
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
            <p style={{ textAlign: 'center' }}>{apod.title}</p>
            <p style={{ textAlign: 'center' }}>{apod.date}</p>
            { video ? (
                <video ref={videoRef} src={secureVideoLink} controls width='100%' onLoadedData={() => setImageLoaded(true)}
                    muted autoPlay playsInline loop />
            ) : (
                <img src={secureImageLink} alt={apod.title} onLoad={() => setImageLoaded(true)}
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