import { css, mul } from '../lib/color';
import { i18n } from '../lib/lang';

const pairs = [
    [['red', '#e5484d'], ['green', '#30a46c']],
    [['orange', '#f5a524'], ['lime', '#6fbf3b']],
    [['pink', '#ff8dcc'], ['gray', '#888888']],
    [['brown', '#8b5a3c'], ['olive', '#7a8f3a']],
    [['blue', '#3e63dd'], ['violet', '#8e4ec6']],
    [['turquoise', '#12a594'], ['steel', '#5f7a99']],
];

export default function Pairs({ fix }: { fix?: number[][] }) {
    return (
        <div className="pairs">
            {pairs.map(pair => (
                <div className="pair" key={pair[0][0]}>
                    <div className="colors">
                        {pair.map(([name, hex]) => {
                            let background = hex;

                            if (fix) {
                                const linear = [1, 3, 5].map(i => {
                                    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
                                    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
                                });
                                background = css(mul(fix, linear.map(v => [v])).map(row => row[0]));
                            }

                            return <span key={name} style={{ background }} />;
                        })}
                    </div>
                    <div className="names">
                        {pair.map(([name]) => <span key={name}>{i18n(name)}</span>)}
                    </div>
                </div>
            ))}
        </div>
    );
}
