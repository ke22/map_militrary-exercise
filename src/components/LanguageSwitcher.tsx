import './LanguageSwitcher.css'

export type LanguageCode = 'zh-Hant' | 'en' | 'ja'

interface LanguageSwitcherProps {
    currentLanguage: LanguageCode
    onLanguageChange: (lang: LanguageCode) => void
}

const languages: { code: LanguageCode; label: string; char: string }[] = [
    { code: 'zh-Hant', label: '繁中', char: '中' },
    { code: 'en', label: 'English', char: 'E' },
    { code: 'ja', label: '日本語', char: '日' },
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
                    {lang.char}
                </button>
            ))}
        </div>
    )
}
