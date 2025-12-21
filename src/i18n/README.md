# Локализация (i18n)

Система локализации на основе i18next и react-i18next.

## Структура

```
src/i18n/
├── config.ts              # Конфигурация i18n
├── translations/
│   ├── en.json           # Английский
│   └── ru.json           # Русский
└── README.md             # Эта документация
```

## Использование

### Базовое использование

```tsx
import { useTranslation } from '@/hooks/use-translation'

function MyComponent() {
  const { t } = useTranslation()

  return <Text>{t('home.title')}</Text>
}
```

### С параметрами

```tsx
const { t } = useTranslation()
const count = 5

// В translations/en.json:
// "items": "You have {{count}} items"

<Text>{t('items', { count })}</Text>
```

### Множественное число

```json
// en.json
{
  "items_zero": "No items",
  "items_one": "1 item",
  "items_other": "{{count}} items"
}
```

```tsx
<Text>{t('items', { count })}</Text>
```

### Форматирование дат и чисел

```tsx
import { formatDate, formatCurrency, formatNumber } from '@/utils/i18n'

const date = new Date()
const price = 1234.56

<Text>{formatDate(date, 'PPP')}</Text>
<Text>{formatCurrency(price, 'USD')}</Text>
<Text>{formatNumber(1234.56)}</Text>
```

## Добавление нового языка

1. Создайте файл `translations/[code].json`
2. Добавьте язык в `config.ts`:

```typescript
import newLang from './translations/[code].json'

resources: {
  en: { translation: en },
  ru: { translation: ru },
  [code]: { translation: newLang },
}
```

3. Добавьте в `LanguageSwitcher`:

```tsx
const LANGUAGES = [
  // ...
  { code: '[code]', name: 'Language', nativeName: 'Native Name' },
]
```

## Экспорт переводов для переводчиков

```bash
node src/scripts/export-translations.js
```

Создаст `translations.csv` с плоской структурой для удобства перевода.

## RTL поддержка

Для RTL языков (арабский, иврит и т.д.) автоматически применяется RTL режим.

Используйте утилиты из `@/utils/rtl` для RTL-aware стилей:

```tsx
import { getRTLStyle, getRTLTransform } from '@/utils/rtl'

// Вместо left/right используйте start/end
<View style={{ paddingStart: 20, marginEnd: 10 }} />

// Для иконок
<Icon style={{ transform: getRTLTransform() }} />
```

## Лучшие практики

1. **Не разбивайте предложения** - используйте полные строки с параметрами
2. **Тестируйте с длинными языками** - немецкий, русский часто длиннее английского
3. **Используйте семантические ключи** - `home.welcome` вместо `text1`
4. **Группируйте по функциональности** - `home.*`, `profile.*`, `settings.*`
