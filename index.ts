import axios from "axios";
import * as dotenv from "dotenv";
import TelegramBot, { Message, PollAnswer } from "node-telegram-bot-api";

import { TEXTS } from "./constants";
import { Participant, Question, UserResult } from "./interfaces";

dotenv.config();

const token = process.env.BOT_TOKEN as string;
const ADMIN_CHAT_ID = process.env.ADMIN_ID as string;
const CHANNEL_ID = process.env.CHANNEL_ID as string;
const bot = new TelegramBot(token, { polling: true });

let questions: Question[] = [];
let participants: Participant[] = [];

// Объект для хранения результатов пользователей
const userResults: { [key: string]: UserResult } = {};
const participantVotes: { [key: string]: number } = {};

// Функция для загрузки вопросов из Google Sheets
export async function loadQuestionsFromSheet(
  spreadsheetUrl: string,
): Promise<void> {
  const sheetIdMatch = spreadsheetUrl.match(
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
  );
  if (!sheetIdMatch) {
    throw new Error(TEXTS.INVALID_URL);
  }
  const sheetId = sheetIdMatch[1];
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

  try {
    const response = await axios.get(sheetUrl);
    const data = JSON.parse(response.data.substr(47).slice(0, -2));
    const rows = data.table.rows;

    questions = rows.map((row: { c: { v: string }[] }) => {
      const cells = row.c;
      return {
        question: cells[0].v,
        options: cells[1].v.split(","),
        correctAnswer: parseInt(cells[2].v, 10),
        pollId: null,
      };
    });
  } catch (_error) {
    throw new Error(TEXTS.QUIZ_LOAD_ERROR);
  }
}

// Функция для отправки вопросов викторины в канал
async function sendQuizToChannel(questionIndex: number): Promise<void> {
  const question = questions[questionIndex];
  try {
    const data = await bot.sendPoll(
      CHANNEL_ID,
      question.question,
      question.options,
      {
        is_anonymous: false,
        type: "quiz",
        correct_option_id: question.correctAnswer,
        explanation: `Правильный ответ: ${question.options[question.correctAnswer]}`,
      },
    );
    // Сохранить идентификатор опроса в вопрос
    questions[questionIndex].pollId = data.poll!.id;
    // Отправить следующий вопрос, если остались вопросы
    if (questionIndex + 1 < questions.length) {
      sendQuizToChannel(questionIndex + 1);
    }
  } catch (error) {
    console.error(TEXTS.QUIZ_SEND_ERROR, error);
  }
}

// Обработка команды /start
bot.onText(
  /\/start (.+)/,
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async (msg: Message, match: RegExpExecArray | null) => {
    const chatId = msg.chat.id;
    if (msg.from && msg.from.id.toString() === ADMIN_CHAT_ID) {
      if (match) {
        const spreadsheetUrl = match[1];
        if (spreadsheetUrl.startsWith("https://")) {
          try {
            await loadQuestionsFromSheet(spreadsheetUrl);
            if (questions.length > 0) {
              for (const key in userResults) {
                delete userResults[key];
              }
              await sendQuizToChannel(0);
              bot.sendMessage(chatId, TEXTS.QUIZ_STARTED);
            } else {
              bot.sendMessage(chatId, TEXTS.QUIZ_LOAD_ERROR);
            }
          } catch (error: any) {
            bot.sendMessage(
              chatId,
              `${TEXTS.QUIZ_LOAD_ERROR} ${error.message}`,
            );
          }
        } else {
          bot.sendMessage(chatId, TEXTS.INVALID_URL);
        }
      }
    } else {
      bot.sendMessage(chatId, TEXTS.NO_ACCESS);
    }
  },
);

// Обработка команды /start_vote
bot.onText(
  /\/start_vote (.+)/,
  async (msg: Message, match: RegExpExecArray | null) => {
    const chatId = msg.chat.id;
    if (msg.from && msg.from.id.toString() === ADMIN_CHAT_ID) {
      if (match) {
        try {
          const input = match[1];
          participants = input.split(";").map((item) => {
            const [rider, horse] = item.split(",");
            return { rider: rider.trim(), horse: horse.trim() };
          });
          const options = participants.map((p) => `${p.rider} на ${p.horse}`);

          // Очистка результатов голосования перед началом нового голосования
          for (const key in participantVotes) {
            delete participantVotes[key];
          }

          bot
            .sendPoll(CHANNEL_ID, "Голосуйте за лучшего участника:", options, {
              is_anonymous: false,
            })
            .then(async () => {
              participants.forEach((participant, index) => {
                participantVotes[options[index]] = 0;
              });
              await bot.sendMessage(chatId, TEXTS.VOTE_STARTED);
            })
            .catch(async (error) => {
              console.error(TEXTS.VOTE_SEND_ERROR, error);
              await bot.sendMessage(chatId, TEXTS.VOTE_SEND_ERROR);
            });
        } catch (error) {
          console.error(TEXTS.VOTE_COMMAND_ERROR, error);
          bot.sendMessage(chatId, TEXTS.VOTE_COMMAND_ERROR);
        }
      }
    } else {
      bot.sendMessage(chatId, TEXTS.NO_ACCESS);
    }
  },
);

// Обработка команды /help
bot.onText(/\/help/, (msg: Message) => {
  bot.sendMessage(msg.chat.id, TEXTS.HELP_MESSAGE, { parse_mode: "Markdown" });
});

// Обработка ответов на опрос викторины и голосования
// eslint-disable-next-line sonarjs/cognitive-complexity
bot.on("poll_answer", (answer: PollAnswer) => {
  try {
    console.log(answer.user);
    const userId = answer.user.id;
    const pollId = answer.poll_id;
    const questionIndex = questions.findIndex((q) => q.pollId === pollId);
    if (questionIndex !== -1) {
      const correct =
        answer.option_ids &&
        answer.option_ids[0] === questions[questionIndex].correctAnswer;
      if (!userResults[userId]) {
        userResults[userId] = {
          username: answer.user.username ?? "unknown",
          correctAnswers: correct ? 1 : 0,
          totalQuestions: 1,
        };
      } else {
        userResults[userId].totalQuestions++;
        if (correct) userResults[userId].correctAnswers++;
      }
    } else {
      const option = answer.option_ids[0];
      const optionText = `${participants[option].rider} на ${participants[option].horse}`;
      if (Object.prototype.hasOwnProperty.call(participantVotes, optionText)) {
        participantVotes[optionText]++;
      }
    }
  } catch (error) {
    console.error(TEXTS.POLL_ANSWER_ERROR, error);
  }
});

// Обработка команды /results
bot.onText(/\/results/, async (msg: Message) => {
  const chatId = msg.chat.id;
  if (msg.from && msg.from.id.toString() === ADMIN_CHAT_ID) {
    try {
      const resultsMessage = formatResultsTable(userResults);
      bot.sendMessage(chatId, resultsMessage, { parse_mode: "Markdown" });

      const chartUrl = await createResultsChart(userResults);
      bot.sendPhoto(chatId, chartUrl, {
        caption: "График результатов викторины",
      });
    } catch (error) {
      console.error(TEXTS.RESULTS_SEND_ERROR, error);
      bot.sendMessage(chatId, TEXTS.RESULTS_SEND_ERROR);
    }
  } else {
    bot.sendMessage(chatId, TEXTS.NO_ACCESS);
  }
});

// Обработка команды /vote_results
bot.onText(/\/vote_results/, async (msg: Message) => {
  const chatId = msg.chat.id;
  if (msg.from && msg.from.id.toString() === ADMIN_CHAT_ID) {
    try {
      const chartUrl = await createVoteResultsChart(participantVotes);
      bot.sendPhoto(chatId, chartUrl, {
        caption: "График голосования за лучшего участника",
      });
    } catch (error) {
      console.error(TEXTS.RESULTS_SEND_ERROR, error);
      bot.sendMessage(chatId, TEXTS.RESULTS_SEND_ERROR);
    }
  } else {
    bot.sendMessage(chatId, TEXTS.NO_ACCESS);
  }
});

// Обработка команды /clearresults
bot.onText(/\/clearresults/, (msg: Message) => {
  const chatId = msg.chat.id;
  if (msg.from && msg.from.id.toString() === ADMIN_CHAT_ID) {
    try {
      for (const key in userResults) {
        delete userResults[key];
      }
      bot.sendMessage(chatId, TEXTS.CLEAR_RESULTS_SUCCESS);
    } catch (error) {
      console.error(TEXTS.CLEAR_RESULTS_ERROR, error);
      bot.sendMessage(chatId, TEXTS.CLEAR_RESULTS_ERROR);
    }
  } else {
    bot.sendMessage(chatId, TEXTS.NO_ACCESS);
  }
});

// Форматирование таблицы результатов
function formatResultsTable(results: { [key: string]: UserResult }): string {
  let table = "*Таблица результатов:*\n\n";
  table += "```\n";
  table += "Пользователь            | Всего вопросов | Правильных ответов\n";
  table += "------------------------|----------------|-------------------\n";
  Object.values(results).forEach((userData) => {
    table += `${userData.username}  | ${userData.totalQuestions}  | ${userData.correctAnswers}\n`;
  });
  table += "```\n";
  return table;
}

// Функция для создания графика результатов викторины
async function createResultsChart(results: {
  [key: string]: UserResult;
}): Promise<string> {
  try {
    const labels = Object.values(results).map((userData) => userData.username);
    const data = Object.values(results).map(
      (userData) => userData.correctAnswers,
    );

    const chartConfig = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Правильные ответы",
            data: data,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  } catch (error) {
    console.error(TEXTS.QUIZ_RESULTS_GRAPH_ERROR, error);
    throw new Error(TEXTS.QUIZ_RESULTS_GRAPH_ERROR);
  }
}

// Функция для создания графика результатов голосования
async function createVoteResultsChart(votes: {
  [key: string]: number;
}): Promise<string> {
  try {
    const labels = Object.keys(votes);
    const data = Object.values(votes);

    const chartConfig = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Голоса",
            data: data,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        animation: {
          duration: 1000,
          easing: "easeInOutBounce",
        },
        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              precision: 0,
              stepSize: 1,
            },
          },
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  } catch (error) {
    console.error(TEXTS.VOTE_RESULTS_GRAPH_ERROR, error);
    throw new Error(TEXTS.VOTE_RESULTS_GRAPH_ERROR);
  }
}

// Вывод инструкции при неизвестной команде
bot.on("message", (msg: Message) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (
    !text.startsWith("/start") &&
    !text.startsWith("/start_vote") &&
    !text.startsWith("/results") &&
    !text.startsWith("/vote_results") &&
    !text.startsWith("/clearresults") &&
    !text.startsWith("/help")
  ) {
    bot.sendMessage(chatId, TEXTS.UNKNOWN_COMMAND);
  }
});
