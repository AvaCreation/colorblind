import { useEffect, useRef, useState } from 'react';
import { modes } from '../lib/color';
import { i18n } from '../lib/lang';
import { digits, makePlate, plateSize, shuffle, type Plate } from '../lib/plate';

const platesPerType = 5;

export default function Test({ done }: { done: (mode: string) => void }) {
    const [list] = useState(() => {
        const pool = shuffle([...digits, ...digits, ...digits]);
        const questions: { type: string; answer: number }[] = [];

        for (const type of modes) {
            for (let i = 0; i < platesPerType; i++) questions.push({ type, answer: pool.pop()! });
        }
        return shuffle(questions);
    });

    const [current, setCurrent] = useState(0);
    const [plate, setPlate] = useState<Plate>(() => makePlate(list[0].type, list[0].answer));
    const fails = useRef<Record<string, number>>({ protanopia: 0, deuteranopia: 0, tritanopia: 0 });
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const ctx = canvas.current!.getContext('2d')!;
        ctx.clearRect(0, 0, plateSize, plateSize);

        for (const dot of plate.dots) {
            ctx.fillStyle = dot.color;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [plate]);

    function answer(digit: number) {
        if (digit !== plate.answer) fails.current[plate.type]++;

        if (current + 1 < list.length) {
            setCurrent(current + 1);
            setPlate(makePlate(list[current + 1].type, list[current + 1].answer));
            return;
        }

        const worst = Math.max(...Object.values(fails.current));
        const found = ['deuteranopia', 'protanopia', 'tritanopia'].find(type => fails.current[type] === worst);
        done(worst < 2 ? 'none' : found!);
    }

    return <>
        <p>{i18n('question', { n: current + 1, total: list.length })}</p>
        <canvas ref={canvas} className="plate" width={plateSize} height={plateSize} />
        <div className="digits">
            {plate.choices.map(choice => <button key={choice} onClick={() => answer(choice)}>{choice}</button>)}
        </div>
        <button onClick={() => answer(-1)}>{i18n('nothing')}</button>
    </>;
}
