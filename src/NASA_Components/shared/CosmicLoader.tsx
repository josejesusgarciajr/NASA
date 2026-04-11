export const CosmicLoader = () => (
    <div className="cosmic-loader">
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="cosmic-loader-text" data-text="FETCHING COSMIC DATA">
                FETCHING COSMIC DATA
            </span>
            <span>
                <span className="cosmic-dot" style={{ animationDelay: '0s' }}>.</span>
                <span className="cosmic-dot" style={{ animationDelay: '0.5s' }}>.</span>
                <span className="cosmic-dot" style={{ animationDelay: '1s' }}>.</span>
            </span>
        </div>
    </div>
)
