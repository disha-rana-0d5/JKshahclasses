import React, { useEffect, useRef } from 'react';
import { animate } from "motion";

interface CountingNumberProps {
    value: string | number;
    duration?: number;
}

export function CountingNumber({ value, duration = 2 }: CountingNumberProps) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const hasPlus = typeof value === 'string' && value.includes('+');
    const targetValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9,]/g, ''), 10) : value;

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        const controls = animate(0, targetValue, {
            duration: duration,
            ease: "easeOut",
            onUpdate: (latest) => {
                node.textContent = Math.floor(latest).toLocaleString();
            },
        });

        return () => controls.stop();
    }, [targetValue, duration]);

    return <span><span ref={nodeRef}>0</span>{hasPlus ? '+' : ''}</span>;
}
