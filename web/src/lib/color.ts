type Matrix = number[][];

export const modes = ['protanopia', 'deuteranopia', 'tritanopia'];

export const presets: Record<string, number[]> = {
    none: [0, 0, 0],
    protanopia: [0.17, 0, 0],
    deuteranopia: [-0.17, 0, 0],
    tritanopia: [0, 0.17, 0],
};

export const sim: Record<string, Matrix> = {
    protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};

const shift: Record<string, Matrix> = {
    protanopia: [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]],
    deuteranopia: [[0, 0, 0], [0.7, 1, 0], [0.7, 0, 1]],
    tritanopia: [[1, 0, 0.3], [0, 1, 0.3], [0, 0, 0]],
};

const identity = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export function mul(a: Matrix, b: Matrix) {
    return a.map(row => b[0].map((_, j) => row.reduce((sum, v, k) => sum + v * b[k][j], 0)));
}

const fix: Record<string, Matrix> = {};
for (const m of modes) {
    const lost = mul(shift[m], sim[m]);
    fix[m] = shift[m].map((row, i) => row.map((v, j) => v - lost[i][j] + identity[i][j]));
}

export function values(mode: string) {
    if (presets[mode]) return presets[mode];
    const [rg, by, sat] = mode.split(':').slice(1).map(Number);
    return [rg || 0, by || 0, sat || 0];
}

export function matrix(mode: string) {
    if (!mode.startsWith('custom')) return fix[mode];

    const [rg, by, sat] = values(mode);
    const rgFix = fix[rg > 0 ? 'protanopia' : 'deuteranopia'];
    const kr = Math.min(1, Math.abs(rg) / 0.5) * 3;
    const kb = Math.min(1, Math.abs(by) / 0.5) * 3;
    const mixed = identity.map((row, i) => row.map((v, j) => v + kr * (rgFix[i][j] - v) + kb * (fix.tritanopia[i][j] - v)));

    const gain = 1 + sat * 1.5;
    const luma = [0.2126, 0.7152, 0.0722];
    const saturation = identity.map((row, i) => row.map((v, j) => (1 - gain) * luma[j] + v * gain));
    return mul(saturation, mixed);
}

export function css(rgb: number[]) {
    const out = rgb.map(v => {
        const c = Math.min(Math.max(v, 0), 1);
        return Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055));
    });
    return 'rgb(' + out.join(',') + ')';
}
