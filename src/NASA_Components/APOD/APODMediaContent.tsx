// nasa
import { useAPODMedia } from '../../hooks/APOD/useAPODMedia';
import type { APOD } from '../../types/NASA/APOD'

type APODMediaContentProps = {
    apod: APOD;
}

export const APODMediaContent = ({apod} : APODMediaContentProps) => {
    const { isVideo, isIframe, secureImageLink, secureVideoLink, videoRef } = useAPODMedia(apod)

    return (
        <>
            { isVideo ? (
                isIframe ? (
                        <iframe 
                            width='100%'
                            style={{ aspectRatio: '16/9', border: 'none' }}
                            src={secureVideoLink}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
        </>
    );
}