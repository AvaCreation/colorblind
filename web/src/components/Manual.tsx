import { useState } from 'react';
import { LuArrowLeft, LuCheck, LuEye, LuEyeOff, LuRotateCcw } from 'react-icons/lu';
import { matrix, modes, presets, values } from '../lib/color';
import { i18n } from '../lib/lang';
import { post } from '../lib/nui';
import Pairs from './Pairs';

const sliderMax = 0.35;

const sliders = [
    { name: 'rg', min: -0.35, left: 'rgLeft', right: 'rgRight' },
    { name: 'by', min: 0, left: 'none', right: 'strong' },
    { name: 'sat', min: 0, left: 'none', right: 'strong' },
];

type Props = {
    mode: string;
    pick: (mode: string) => void;
    back: () => void;
    apply: () => void;
};

export default function Manual({ mode, pick, back, apply }: Props) {
    const [raw, setRaw] = useState(false);
    const current = values(mode);

    function choose(next: string) {
        setRaw(false);
        pick(next);
    }

    return <>
        <p>{i18n('manualIntro')}</p>

        <div className="tabs">
            {['none', ...modes].map(name => (
                <button key={name} className={current.every((v, i) => v === presets[name][i]) ? 'tab on' : 'tab'} onClick={() => choose(name)}>
                    {i18n(name === 'none' ? 'off' : name)}
                </button>
            ))}
        </div>

        <Pairs fix={raw ? undefined : matrix(mode)} />

        <div className="sliders">
            {sliders.map((slider, i) => {
                const position = (current[i] - slider.min) / (sliderMax - slider.min) * 100;
                const origin = slider.min < 0 ? 50 : 0;
                const style = { '--from': Math.min(origin, position) + '%', '--to': Math.max(origin, position) + '%' } as React.CSSProperties;

                return (
                    <div key={slider.name}>
                        <div className="top">
                            {i18n(slider.name)}
                            <span className={current[i] ? 'value on' : 'value'}>
                                {current[i] > 0 && slider.min < 0 ? '+' : ''}{Math.round(current[i] * 100)} %
                            </span>
                        </div>
                        <input
                            type="range"
                            min={slider.min}
                            max={sliderMax}
                            step={0.01}
                            value={current[i]}
                            style={style}
                            onChange={e => {
                                const next = [...current];
                                next[i] = +e.target.value;
                                choose(next.some(v => v) ? 'custom:' + next.join(':') : 'none');
                            }}
                        />
                        <div className="ends"><span>{i18n(slider.left)}</span><span>{i18n(slider.right)}</span></div>
                    </div>
                );
            })}
        </div>

        <div className="row">
            <button className={raw ? 'round on' : 'round'} onClick={() => {
                setRaw(!raw);
                post('preview', { mode: raw ? mode : 'none' });
            }}>
                {raw ? <LuEye /> : <LuEyeOff />}{i18n(raw ? 'withFix' : 'withoutFix')}
            </button>
            <button className="round" onClick={() => choose('none')}><LuRotateCcw />{i18n('reset')}</button>
        </div>

        <div className="row">
            <button onClick={back}><LuArrowLeft />{i18n('back')}</button>
            <button className="main" onClick={apply}><LuCheck />{i18n('apply')}</button>
        </div>
    </>;
}
