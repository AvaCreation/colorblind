import { useEffect, useState } from 'react';
import { LuEye, LuX } from 'react-icons/lu';
import Manual from './components/Manual';
import Pairs from './components/Pairs';
import Test from './components/Test';
import { matrix, modes } from './lib/color';
import { setLang, i18n } from './lib/lang';
import { inGame, post } from './lib/nui';

export default function App() {
    const [open, setOpen] = useState(!inGame);
    const [page, setPage] = useState('intro');
    const [mode, setMode] = useState('none');
    const [found, setFound] = useState('none');

    function pick(next: string) {
        setMode(next);
        post('preview', { mode: next });
    }

    function close() {
        setOpen(false);
        post('close');
    }

    function apply() {
        post('save', { mode });
        close();
    }

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            if (e.data.action === 'open') {
                setLang(e.data.lang);
                setMode(e.data.mode);
                setPage('intro');
                setOpen(true);
            }
            if (e.data.action === 'close') setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        window.addEventListener('message', onMessage);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('message', onMessage);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    if (!open) return null;

    return (
        <div className="window">
            <div className="box">
                <div className="head">
                    <span><LuEye />{i18n('title')}</span>
                    <button onClick={close}><LuX /></button>
                </div>

                {page === 'intro' && <>
                    <p>{i18n('intro')}</p>
                    <div className="row">
                        <button className="main" onClick={() => setPage('manual')}>{i18n('manual')}</button>
                        <button onClick={() => setPage('test')}>{i18n('test')}</button>
                    </div>
                </>}

                {page === 'test' && <Test done={result => {
                    setFound(result);
                    pick(result);
                    setPage('result');
                }} />}

                {page === 'manual' && <Manual mode={mode} pick={pick} back={() => setPage('intro')} apply={apply} />}

                {page === 'result' && <>
                    <p>{i18n('result', { mode: i18n(found === 'none' ? 'off' : found) })}</p>
                    <div className="modes">
                        {['none', ...modes].map(name => (
                            <button key={name} className={mode === name ? 'mode on' : 'mode'} onClick={() => pick(name)}>
                                {i18n(name === 'none' ? 'off' : name)}
                                {name === found && <span className="tag">{i18n('recommended')}</span>}
                            </button>
                        ))}
                    </div>
                    <p className="hint">{i18n('hint')}</p>
                    <Pairs fix={matrix(mode)} />
                    <div className="row">
                        <button onClick={() => setPage('intro')}>{i18n('retry')}</button>
                        <button onClick={() => setPage('manual')}>{i18n('adjust')}</button>
                        <button className="main" onClick={apply}>{i18n('apply')}</button>
                    </div>
                </>}
                <p className="hint credit">Made by AVA Creation</p>
            </div>
        </div>
    );
}
