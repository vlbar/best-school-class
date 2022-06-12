import { useEffect } from "react";

export default function useOutsideClick(ref, callback) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                // just for cringe
                setTimeout(() => {
                    callback?.();
                }, 1);
            }
        }
        
        document.addEventListener("mouseup", handleClickOutside);
        return () => {
            document.removeEventListener("mouseup", handleClickOutside);
        };
    }, [ref]);
}
