import { useEffect, useRef } from "react";

export function useInfiniteScroll(ref, callback, enabled = true) {
    const observerRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;
        if (!ref.current) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    callback();
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0
            }
        );

        observerRef.current.observe(ref.current);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [callback, enabled]);
}
