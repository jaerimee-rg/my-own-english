export type Scenario = {
  id: string;
  label: string;
  description: string;
  /** Who the AI plays. */
  role: "student" | "tutor";
  systemPrompt: string;
};

const STUDENT_BASE =
  "You are a friendly young rhythmic-gymnastics student in an English lesson. " +
  "Reply in simple, natural English (1–2 short sentences). Stay in character as the child. " +
  "If the teacher makes a small English mistake, you may gently model the correct phrasing.";

const TUTOR_BASE =
  "You are a warm English conversation tutor for a Korean rhythmic-gymnastics teacher. " +
  "Keep replies short and natural. Encourage them, and when helpful, suggest a more natural way to say something.";

export const SCENARIOS: Scenario[] = [
  {
    id: "free",
    label: "자유 대화",
    description: "주제 없이 자유롭게 영어로 대화",
    role: "tutor",
    systemPrompt: `${TUTOR_BASE} Let the teacher lead the topic.`,
  },
  {
    id: "greeting",
    label: "인사 나누기",
    description: "수업 시작 인사 연습",
    role: "student",
    systemPrompt: `${STUDENT_BASE} The scene is the start of class — greet the teacher and respond to greetings.`,
  },
  {
    id: "instruction",
    label: "동작 지도",
    description: "동작을 영어로 지시하는 연습",
    role: "student",
    systemPrompt: `${STUDENT_BASE} The teacher is instructing gymnastics movements (with ribbon, hoop, ball, clubs, or rope). React as a student following the instructions.`,
  },
  {
    id: "praise",
    label: "칭찬하기",
    description: "잘했을 때 칭찬 표현 연습",
    role: "student",
    systemPrompt: `${STUDENT_BASE} You just performed a movement; respond happily when the teacher praises you.`,
  },
  {
    id: "correction",
    label: "교정하기",
    description: "자세를 부드럽게 고쳐주는 연습",
    role: "student",
    systemPrompt: `${STUDENT_BASE} You made a small mistake in a movement; respond as the teacher gently corrects you.`,
  },
  {
    id: "closing",
    label: "마무리 인사",
    description: "수업을 정리하고 마무리하는 연습",
    role: "student",
    systemPrompt: `${STUDENT_BASE} The scene is the end of class — say goodbye and respond to the teacher's closing remarks.`,
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
