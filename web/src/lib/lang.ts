const modules = import.meta.glob<Record<string, string>>('../locales/*.json', { eager: true, import: 'default' });

const locales: Record<string, Record<string, string>> = {};
for (const path in modules) locales[path.match(/([^/]+)\.json$/)![1]] = modules[path];

const pick = (lang: string) => locales[lang] ?? locales[lang.slice(0, 2)] ?? locales.en;

let texts = pick(navigator.language);

export function setLang(lang: string) {
    texts = pick(lang);
}

export function i18n(key: string, vars: Record<string, string | number> = {}) {
    return (texts[key] ?? locales.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(vars[name]));
}
