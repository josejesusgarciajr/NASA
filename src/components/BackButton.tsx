
type BackButtonProps = {
    text: string;
    handleBack: () => void;
}

export const BackButton = ({text, handleBack} : BackButtonProps) => {
    return (
        <>
            <div
                onClick={handleBack}
                style={{
                    position: 'fixed', top: '80px', left: '20px',
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', zIndex: 1000,
                }}
            >
                {text}
            </div>
        </>
    )
}