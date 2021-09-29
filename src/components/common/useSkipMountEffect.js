import { useState, useEffect } from 'react'

function useSkipMountEffect(effect, deps, cleanup) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        if (isMounted) effect()
        setIsMounted(true)
        return cleanup?.()
    }, deps)
}

export default useSkipMountEffect
