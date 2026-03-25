// nasa
import type { APOD } from "../../types/NASA/APOD"

// react
import { useEffect, useRef } from 'react'

export function useAPODMedia(apod: APOD) {
    const isVideo = apod.media_type === 'video';
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
        if (isVideo && videoRef.current) {
            if (!isIframe) {
                videoRef.current.play();
            }
        }
    }, [apod]);

    return { isVideo, isIframe, secureVideoLink, secureImageLink, videoRef };
}