import type { APOD } from '../types/NASA/APOD'
import { useRef, useEffect } from 'react'

type APODDisplayProps = {
    apod: APOD;
}

export const APODDisplay = ({apod} : APODDisplayProps) => {
    const video = apod.media_type === 'video';
    const isIframe = 
        (
            apod.url?.includes('youtube') || 
            apod.url?.includes('youtu.be') ||
            apod.url?.includes('solarsystem.nasa.gov') ||
            apod.url?.includes('vimeo.com')
        ) ?? false;
    const secureVideoLink = apod.url?.replace('http://', 'https://');
    const secureImageLink = apod.hdurl?.replace('http://', 'https://');
    const videoRef = useRef<HTMLVideoElement>(null);

    // play video on app mount
    useEffect(() => {
        if (video && videoRef.current) {
            if (!isIframe) {
                videoRef.current.play();
            }
        }
    }, [apod]);

    return (
        <>
            <p style={{ textAlign: 'center' }}>{apod.title}</p>
            <p style={{ textAlign: 'center' }}>{apod.date}</p>
            { video ? (
                 isIframe ? (
                        <iframe 
                            width='100%'
                            style={{ aspectRatio: '16/9', border: 'none' }}
                            src={secureVideoLink}
                            allowFullScreen
                        >
                        </iframe>
                    )
                    : (
                        <video ref={videoRef} src={secureVideoLink} controls width='100%'
                            muted autoPlay playsInline loop />
                    )
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