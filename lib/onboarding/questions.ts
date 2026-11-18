import type { FirstStepId, GuideAnswers, GuideGoal, GuideQuestion, GuideStart } from "./types";

/**
 * The guide's two questions. Each answer explains, in one sentence, which part
 * of the site it belongs to, so a newcomer learns what the parts are while
 * answering. Every claim here is one the destination page already makes.
 */
export const GUIDE_QUESTIONS: GuideQuestion[] = [
  {
    id: "goal",
    prompt: "What brought you here?",
    options: [
      { id: "learn", label: "Learn how investing works", explains: "That is Courses: two courses of interactive lessons, starting from the basics." },
      { id: "company", label: "Look inside a real company", explains: "That is Company reports, and the daily puzzle built from them." },
      { id: "build", label: "Try building a portfolio", explains: "That is Studio, where you research a business, build a portfolio and test your assumptions." },
      { id: "unsure", label: "I am not sure yet", explains: "Then start with Finance Foundations, the course for people new to finance." },
    ],
  },
  {
    id: "start",
    prompt: "Where are you starting from?",
    options: [
      { id: "new", label: "I am new to finance", explains: "The lessons start at the beginning and explain each new word where it first appears." },
      { id: "some", label: "I know the basics, or I have invested", explains: "Every lesson is open, so you can skip what you already know." },
    ],
  },
];

const GOALS: readonly GuideGoal[] = ["learn", "company", "build", "unsure"];
const STARTS: readonly GuideStart[] = ["new", "some"];

export const isGoal = (value: unknown): value is GuideGoal => GOALS.includes(value as GuideGoal);
export const isStart = (value: unknown): value is GuideStart => STARTS.includes(value as GuideStart);

/**
 * Where the answers lead first.
 *
 * Investment Foundations is offered first only to someone who wants to build
 * a portfolio and already knows the basics: the Courses page says to start
 * with Finance Foundations and then use it in Investment Foundations, so a
 * newcomer who wants a portfolio still starts at the foundations.
 */
export function firstStepFor(answers: GuideAnswers): FirstStepId {
  if (answers.goal === "company") return "daily";
  if (answers.goal === "build" && answers.start === "some") return "investment-foundations";
  return "finance-foundations";
}
