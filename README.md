# Telegram Quiz Bot

Этот проект реализует бота для Telegram, который проводит викторины и голосования, а также отображает результаты в виде
графиков. Бот использует Google Sheets для загрузки вопросов викторины и QuickChart для генерации графиков результатов.

## Установка

1. Клонируйте репозиторий:
   ```sh
   git clone https://github.com/Blynskyniki/quizz_telegram_bot.git
   cd telegram-quiz-bot
   ```

2. Установите зависимости:
   ```sh
   npm install
   ```

3. Создайте файл `.env` в корневом каталоге проекта и добавьте следующие переменные окружения:
   ```
   BOT_TOKEN=your-telegram-bot-token
   ADMIN_ID=your-telegram-user-id
   CHANNEL_ID=your-telegram-channel-id
   ```

## Использование

Запустите бота:

```sh
npm run build
npm start
```

### Инструкция по использованию Telegram бота для викторин и опросов

[Инструкция](./README_ADM.md)

## Структура проекта

- `src/bot.ts`: Основной файл бота, содержащий логику работы.
- `src/constants.ts`: Константы, используемые в проекте.
- `src/interfaces.ts`: Интерфейсы TypeScript, используемые в проекте.

## Зависимости

- `axios`: Для выполнения HTTP-запросов.
- `dotenv`: Для работы с переменными окружения.
- `node-telegram-bot-api`: Для взаимодействия с API Telegram.


