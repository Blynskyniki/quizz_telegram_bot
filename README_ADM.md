### Инструкция по использованию Telegram бота для викторин и опросов

#### Введение

Этот бот для Telegram предназначен для создания и управления викторинами и опросами. Он использует данные из Google
Sheets, отправляет их в канал Telegram, обрабатывает ответы пользователей и генерирует результаты.

#### Подготовка к работе

1. **Настройка окружения:**
    - Убедитесь, что файл `.env` содержит правильные значения:
      ```
      BOT_TOKEN=your-telegram-bot-token
      ADMIN_ID=comma-separated-admin-ids
      CHANNEL_ID=your-telegram-channel-id
      ```

2. **Запуск бота:**
    - Запустите бота, убедившись, что все зависимости установлены, и файл `.env` корректно заполнен.

#### Основные команды

1. **/start_quizz <url>**
    - **Описание:** Начинает викторину, загружая вопросы из указанного URL Google Sheets.
    - **Использование:** Отправьте команду `/start_quizz <url>` с ссылкой на Google Sheets, содержащий вопросы для
      викторины.
    - **Пример:** `/start_quizz https://docs.google.com/spreadsheets/d/19v0U19Ltb-1Pk_lcU-IUQwWqxRo1wOsRFePNk5cLM4Y`

2. **/start_vote <участники>**
    - **Описание:** Начинает голосование за лучших участников.
    - **Использование:** Отправьте команду `/start_vote <участники>`, где `<участники>` — это список участников в
      формате `участник, лошадь; участник, лошадь; ...`.
    - **Пример:** `/start_vote Иван Иванов, Белый конь; Петр Петров, Черный конь`

3. **/help**
    - **Описание:** Отправляет сообщение с информацией о доступных командах.
    - **Использование:** Отправьте команду `/help`.

4. **/quizz_results**
    - **Описание:** Отправляет результаты викторины в формате Excel.
    - **Использование:** Отправьте команду `/quizz_results`.

5. **/vote_results**
    - **Описание:** Отправляет результаты голосования в виде диаграммы.
    - **Использование:** Отправьте команду `/vote_results`.

6. **/clearresults**
    - **Описание:** Очищает результаты викторины.
    - **Использование:** Отправьте команду `/clearresults`.
7. **/clear_vote_results**
    - **Описание:** Очищает результаты голосования.
    - **Использование:** Отправьте команду `/clear_vote_results`.

#### Обработка ответов пользователей

- **Викторина:** Бот обрабатывает ответы пользователей на вопросы викторины и обновляет количество правильных и общих
  ответов для каждого пользователя.
- **Голосование:** Бот обрабатывает ответы на голосования и обновляет количество голосов за каждого участника.

#### Форматирование и отправка результатов

- **Результаты викторины:** Результаты форматируются в таблицу Excel и отправляются администратору. Таблица содержит
  информацию о пользователях, количестве правильных ответов и общем количестве вопросов.
- **Результаты голосования:** Создается диаграмма результатов голосования с использованием API QuickChart, которая
  отправляется в канал.

#### Примечания

- Команды, связанные с началом викторины и голосования, а также с получением результатов, доступны только
  администраторам, чьи идентификаторы указаны в настройках.
- Бот поддерживает асинхронные операции для загрузки данных и отправки сообщений, что обеспечивает бесперебойную работу
  и взаимодействие с пользователями.
