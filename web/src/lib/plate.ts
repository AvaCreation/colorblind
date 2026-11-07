import { css, sim } from './color';

export const plateSize = 360;

export const digits = [2, 3, 4, 5, 6, 7, 8, 9];

const bases = [
    [0.45, 0.35, 0.3], [0.3, 0.45, 0.35], [0.4, 0.4, 0.55],
    [0.55, 0.4, 0.35], [0.35, 0.5, 0.45], [0.5, 0.45, 0.35],
];

export type Plate = {
    type: string;
    answer: number;
    choices: number[];
    dots: { x: number; y: number; r: number; color: string }[];
};

export const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5);

export function makePlate(type: string, answer: number): Plate {
    const [a, b] = sim[type];
    const cross = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const axis = cross.map(v => v / Math.hypot(...cross));
    const base = bases[Math.floor(Math.random() * bases.length)].map(v => v + (Math.random() - 0.5) * 0.08);

    function room(sign: number) {
        let min = Infinity;
        axis.forEach((v, i) => {
            if (v * sign > 0) min = Math.min(min, (1 - base[i]) / (v * sign));
            if (v * sign < 0) min = Math.min(min, base[i] / -(v * sign));
        });
        return min;
    }
    const amount = Math.min(0.16, room(1) * 0.85, room(-1) * 0.85);

    const mask = document.createElement('canvas');
    mask.width = mask.height = plateSize;
    const ctx = mask.getContext('2d')!;
    ctx.font = 'bold ' + plateSize * 0.85 + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(answer), plateSize / 2, plateSize * 0.54);
    const pixels = ctx.getImageData(0, 0, plateSize, plateSize).data;

    const dots: Plate['dots'] = [];
    for (let tries = 0; tries < 6000 && dots.length < 800; tries++) {
        const r = 3.5 + Math.random() * 6;
        const x = Math.random() * plateSize;
        const y = Math.random() * plateSize;

        if (Math.hypot(x - plateSize / 2, y - plateSize / 2) > plateSize / 2 - r) continue;
        if (dots.some(d => Math.hypot(d.x - x, d.y - y) < d.r + r + 1.2)) continue;

        const onDigit = pixels[(Math.floor(y) * plateSize + Math.floor(x)) * 4 + 3] > 128;
        const shift = (onDigit ? amount : -amount) + (Math.random() - 0.5) * 0.04;
        const shade = 0.7 + Math.random() * 0.6;
        dots.push({ x, y, r, color: css(base.map((v, i) => (v + axis[i] * shift) * shade)) });
    }

    const wrong = shuffle(digits.filter(d => d !== answer)).slice(0, 3);
    return { type, answer, dots, choices: shuffle([answer, ...wrong]) };
}
