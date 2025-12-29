import './LanguageSwitcher.css'

export type LanguageCode = 'zh-Hant' | 'en' | 'ja'

interface LanguageSwitcherProps {
    currentLanguage: LanguageCode
    onLanguageChange: (lang: LanguageCode) => void
}

const languages: { code: LanguageCode; label: string }[] = [
    { code: 'zh-Hant', label: '繁中' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
]

export function LanguageSwitcher({
    currentLanguage,
    onLanguageChange,
}: LanguageSwitcherProps) {
    return (
        <div className="language-switcher">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    className={`lang-btn ${currentLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => onLanguageChange(lang.code)}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    )
}
