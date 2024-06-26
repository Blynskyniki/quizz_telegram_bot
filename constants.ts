export const TEXTS = {
  HELP_MESSAGE: `
*Инструкция по использованию бота:*

/start\\_quizz <URL> - Начать викторину, загрузив вопросы из Google Sheets по указанному URL.
/start\\_vote <участники> - Начать голосование за лучшего участника, где \`участники\` вводятся в формате \`имя всадника, кличка лошади; имя всадника, кличка лошади\`.
/quizz\\_results - Показать результаты викторины.
/vote\\_results - Показать результаты голосования за лучшего участника.
/clearresults - Очистить результаты викторины.
/clear\\_vote\\_results - Очистить результаты голосования
/get\\_chatID - Вернуть идентификатор чата/канала/группы
/help - Показать эту инструкцию.
  `,
  INVALID_URL: "Пожалуйста, укажите корректный URL Google Sheets.",
  NO_ACCESS: "У вас нет доступа к этой команде.",
  QUIZ_STARTED: "Викторина началась в канале! Ответы появятся там.",
  QUIZ_LOAD_ERROR: "Не удалось загрузить вопросы из Google Sheets.",
  QUIZ_SEND_ERROR: "Ошибка при отправке опроса:",
  VOTE_STARTED: "Голосование началось в канале!",
  VOTE_SEND_ERROR: "Ошибка при отправке голосования.",
  VOTE_COMMAND_ERROR: "Ошибка при обработке команды /start_vote.",
  POLL_ANSWER_ERROR: "Ошибка при обработке ответа на опрос:",
  RESULTS_SEND_ERROR: "Ошибка при отправке результатов.",
  CLEAR_RESULTS_SUCCESS: "Результаты викторины были успешно очищены.",
  CLEAR_VOTE_RESULTS_SUCCESS: "Результаты голосования были успешно очищены.",
  CLEAR_RESULTS_ERROR: "Ошибка при очистке результатов.",
  CLEAR_VOTE_RESULTS_ERROR: "Ошибка при очистке результатов.",
  UNKNOWN_COMMAND:
    "Неизвестная команда. Используйте /help для получения списка команд.",
  QUIZ_RESULTS_GRAPH_ERROR:
    "Ошибка при создании графика результатов викторины.",
  VOTE_RESULTS_GRAPH_ERROR:
    "Ошибка при создании графика результатов голосования.",
};
