// Default game data — loaded when no admin customizations exist in localStorage
const DEFAULT_GAME_DATA = {
  title: "Deutsche Bank World Cup Challenge",
  password: "DB2024",
  scoring: {
    correct: 100,   // points awarded for a correct answer
    wrong: 25,      // points deducted for a wrong answer
    timeLimit: 30   // seconds to answer a question (0 = no time limit)
  },
  modules: [
    {
      id: 1,
      name: "Module 1",
      team: "Payments Team A",
      description: "Payment Fundamentals",
      icon: "💳",
      color: "#0066B3",
      questions: [
        {
          question: "What does SWIFT stand for?",
          options: [
            "Society for Worldwide Interbank Financial Telecommunication",
            "Secure Wire Interbank Financial Transfer",
            "Standard World International Fund Transfer",
            "System for Worldwide Instant Financial Transactions"
          ],
          correct: 0,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "SWIFT is a global messaging network used by financial institutions to securely transmit payment instructions and information."
        },
        {
          question: "What is a correspondent bank?",
          options: [
            "A bank that handles foreign exchange exclusively",
            "An intermediary bank that facilitates cross-border transactions between other banks",
            "A bank that only processes domestic wire transfers",
            "The central bank of a given country"
          ],
          correct: 1,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "Correspondent banks act as agents for other banks, enabling them to execute transactions in markets where they don't have a direct presence."
        },
        {
          question: "What does SEPA stand for?",
          options: [
            "Standard European Payment Association",
            "Single Euro Payments Area",
            "Secure European Payment Authorization",
            "Standard Exchange Payment Agreement"
          ],
          correct: 1,
          points: 125,   // points awarded for a correct answer to this question
          penalty: 30,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "SEPA (Single Euro Payments Area) is an initiative that standardizes euro-denominated cashless payments across 36 European countries."
        }
      ]
    },
    {
      id: 2,
      name: "Module 2",
      team: "FX & Treasury Team",
      description: "Foreign Exchange & Treasury",
      icon: "💱",
      color: "#004A99",
      questions: [
        {
          question: "What is a 'spot' FX transaction?",
          options: [
            "A future agreement to exchange currencies at a set rate",
            "A currency exchange at today's market rate, settling in T+2",
            "A hedging instrument used by central banks only",
            "A currency exchange settling in 30 days"
          ],
          correct: 1,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "A spot FX transaction is the purchase or sale of a currency at the current market (spot) rate, typically settling two business days later (T+2)."
        },
        {
          question: "What does 'nostro account' refer to?",
          options: [
            "Our bank's account held at a foreign bank, in that bank's local currency",
            "A client's multi-currency savings account",
            "A shared interbank clearing account",
            "The central bank's reserve account"
          ],
          correct: 0,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "Nostro (Latin: 'ours') refers to an account a bank holds at a foreign correspondent bank, denominated in that foreign bank's currency."
        },
        {
          question: "What is liquidity risk?",
          options: [
            "The risk of losing money on stock investments",
            "The risk of fraud in liquid asset portfolios",
            "The risk of being unable to meet short-term financial obligations",
            "The risk of inflation eroding capital over time"
          ],
          correct: 2,
          points: 150,   // points awarded for a correct answer to this question
          penalty: 35,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "Liquidity risk is the danger that a bank or entity cannot quickly convert assets to cash to meet its short-term obligations without incurring significant losses."
        }
      ]
    },
    {
      id: 3,
      name: "Module 3",
      team: "Compliance Team",
      description: "Compliance & Regulation",
      icon: "🛡️",
      color: "#003D7C",
      questions: [
        {
          question: "What does KYC stand for in banking?",
          options: [
            "Keep Your Capital",
            "Know Your Customer",
            "Key Yield Certificate",
            "Know Your Counterparty"
          ],
          correct: 1,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "KYC (Know Your Customer) is the mandatory process by which banks verify the identity of their clients to prevent fraud, money laundering, and other financial crimes."
        },
        {
          question: "AML compliance is primarily designed to prevent:",
          options: [
            "Asset mismanagement and poor investment returns",
            "Money laundering and terrorist financing",
            "Market manipulation and insider trading",
            "Interest rate speculation"
          ],
          correct: 1,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "Anti-Money Laundering (AML) frameworks prevent criminals from disguising illegally obtained funds as legitimate income by layering them through the financial system."
        },
        {
          question: "Under PSD2, Strong Customer Authentication (SCA) requires:",
          options: [
            "Only a password",
            "Biometric verification only",
            "At least two of three factors: something you know, have, or are",
            "A physical token and a PIN only"
          ],
          correct: 2,
          points: 175,   // points awarded for a correct answer to this question
          penalty: 40,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "SCA under PSD2 requires verification using at least two independent factors: something you know (password), something you have (phone/token), or something you are (biometrics)."
        }
      ]
    },
    {
      id: 4,
      name: "Module 4",
      team: "Digital Innovation Team",
      description: "Digital Banking & Innovation",
      icon: "🚀",
      color: "#0080CC",
      questions: [
        {
          question: "What is Open Banking?",
          options: [
            "Banking services available 24 hours a day",
            "API-driven sharing of bank data with authorized third-party providers",
            "A new type of free checking account with no fees",
            "Banking exclusively through mobile applications"
          ],
          correct: 1,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "Open Banking enables regulated third-party providers to access bank data via standardized APIs — with the customer's consent — to build new financial products and services."
        },
        {
          question: "What does ISO 20022 refer to?",
          options: [
            "An EU cybersecurity compliance standard",
            "An international standard for electronic data interchange in financial messaging",
            "A framework for central bank digital currencies",
            "A risk management standard for payment processors"
          ],
          correct: 1,
          points: 100,   // points awarded for a correct answer to this question
          penalty: 25,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "ISO 20022 is a global standard for financial messaging that enables richer structured payment data, improving interoperability and enabling better straight-through processing."
        },
        {
          question: "What is a digital wallet?",
          options: [
            "A physical device that stores digital currency",
            "A software application that securely stores payment credentials for digital transactions",
            "A type of cryptocurrency exchange platform",
            "A bank account with no associated physical card"
          ],
          correct: 1,
          points: 150,   // points awarded for a correct answer to this question
          penalty: 30,   // points deducted for a wrong answer to this question
          timeLimit: 30, // seconds to answer this question (0 = no time limit)
          explanation: "A digital wallet (e.g., Apple Pay, Google Pay) securely stores payment credentials and enables contactless in-store payments, online purchases, and peer-to-peer transfers."
        }
      ]
    }
  ]
};

const DataManager = {
  GAME_KEY: "dbwc_game_data",
  SCORES_KEY: "dbwc_leaderboard",

  get() {
    try {
      const saved = localStorage.getItem(this.GAME_KEY);
      const parsed = saved ? JSON.parse(saved) : this._clone(DEFAULT_GAME_DATA);
      // Backfill defaults for data saved before newer fields existed
      if (!parsed.scoring) parsed.scoring = this._clone(DEFAULT_GAME_DATA.scoring);
      if (typeof parsed.scoring.correct   !== "number") parsed.scoring.correct   = DEFAULT_GAME_DATA.scoring.correct;
      if (typeof parsed.scoring.wrong     !== "number") parsed.scoring.wrong     = DEFAULT_GAME_DATA.scoring.wrong;
      if (typeof parsed.scoring.timeLimit !== "number") parsed.scoring.timeLimit = DEFAULT_GAME_DATA.scoring.timeLimit;
      // Each question carries its own point value (modular per-question scoring) —
      // backfill any question saved before this existed using the global defaults
      (parsed.modules || []).forEach(mod => {
        (mod.questions || []).forEach(q => {
          if (typeof q.points    !== "number") q.points    = parsed.scoring.correct;
          if (typeof q.penalty   !== "number") q.penalty   = parsed.scoring.wrong;
          if (typeof q.timeLimit !== "number") q.timeLimit = parsed.scoring.timeLimit;
        });
      });
      return parsed;
    } catch {
      return this._clone(DEFAULT_GAME_DATA);
    }
  },

  save(data) {
    localStorage.setItem(this.GAME_KEY, JSON.stringify(data));
  },

  reset() {
    localStorage.removeItem(this.GAME_KEY);
  },

  getLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem(this.SCORES_KEY) || "[]");
    } catch {
      return [];
    }
  },

  saveScore(teamName, score, elapsedSeconds) {
    const board = this.getLeaderboard();
    board.push({
      team: teamName,
      score,
      time: elapsedSeconds,
      date: new Date().toISOString()
    });
    board.sort((a, b) => b.score - a.score || a.time - b.time);
    const top10 = board.slice(0, 10);
    localStorage.setItem(this.SCORES_KEY, JSON.stringify(top10));
    return top10;
  },

  clearLeaderboard() {
    localStorage.removeItem(this.SCORES_KEY);
  },

  _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
