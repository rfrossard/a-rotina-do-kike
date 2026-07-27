"use client";

import {
  BarChart3,
  Bath,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Gift,
  Gamepad2,
  Home,
  IceCream,
  Lock,
  Music2,
  Palette,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Timer,
  Trash2,
  Trophy,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Routine = {
  id: string;
  label: string;
  helper: string;
  icon: typeof Sun;
  accent: string;
  missions: string[];
};

type Reward = {
  id: string;
  title: string;
  helper: string;
  price: number;
  icon: typeof Gift;
  accent: string;
  action?: "avatars";
  timerMinutes?: number;
};

type DailyProgress = { day: string; earned: number; spent: number };
type ActivityTotal = { activity: string; count: number };
type ActiveTimer = {
  id: string;
  label: string;
  seconds: number;
  totalSeconds: number;
  running: boolean;
  mission?: string;
};
type Celebration = {
  title: string;
  message: string;
  points: number;
};
type ActivityApproval = {
  id: string;
  activity: string;
  routine_id: string;
  points: number;
  status: "pending" | "approved" | "rejected";
  requested_day: string;
  requested_at: string;
};

type ScreenWakeLock = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

const ROUTINES: Routine[] = [
  {
    id: "manha",
    label: "Bom dia!",
    helper: "Comece o dia",
    icon: Sun,
    accent: "#ffb629",
    missions: ["Acordar", "Arrumar a cama", "Escovar os dentes", "Café da manhã"],
  },
  {
    id: "banho",
    label: "Hora do banho",
    helper: "Ficar limpinho",
    icon: Bath,
    accent: "#39a9f2",
    missions: ["Separar a roupa", "Tomar banho", "Vestir a roupa", "Guardar a toalha"],
  },
  {
    id: "escola",
    label: "Volta da escola",
    helper: "Missões da tarde",
    icon: BookOpen,
    accent: "#9564dc",
    missions: ["Guardar a mochila", "Fazer o lanche", "Fazer a lição", "Organizar a mesa"],
  },
  {
    id: "exercicios",
    label: "Mexer o corpo",
    helper: "Energia em ação",
    icon: Dumbbell,
    accent: "#4fc56a",
    missions: ["Colocar o tênis", "Alongar", "Fazer exercícios", "Beber água"],
  },
  {
    id: "casa",
    label: "Ajudar em casa",
    helper: "Herói da família",
    icon: Home,
    accent: "#f06a5f",
    missions: ["Guardar brinquedos", "Arrumar a mesa", "Regar as plantas", "Organizar o quarto"],
  },
  {
    id: "estudos",
    label: "Hora de estudar",
    helper: "Foco na mesa",
    icon: BookOpen,
    accent: "#7c62d8",
    missions: ["Preparar a mesa", "Revisar a matéria", "Fazer os exercícios", "Guardar o material"],
  },
  {
    id: "refeicoes",
    label: "Hora da refeição",
    helper: "Energia no prato",
    icon: Utensils,
    accent: "#ef9b2d",
    missions: ["Lavar as mãos", "Sentar à mesa", "Comer com calma", "Levar o prato"],
  },
  {
    id: "piano",
    label: "Treino de piano",
    helper: "Hora da música",
    icon: Music2,
    accent: "#e1608c",
    missions: ["Sentar com postura", "Aquecer os dedos", "Praticar a música", "Tocar para a família"],
  },
];

const AVATARS = [
  { id: "classico", label: "Clássico", detail: "Sem óculos · moletom teal", col: 0, row: 0, price: 0 },
  { id: "explorador", label: "Explorador", detail: "Óculos azuis · moletom verde", col: 1, row: 0, price: 0 },
  { id: "bone-vermelho", label: "Boné vermelho", detail: "Óculos azuis · camiseta amarela", col: 2, row: 0, price: 0 },
  { id: "cacheado", label: "Cacheado", detail: "Óculos azuis · visual grafite", col: 3, row: 0, price: 0 },
  { id: "laranja", label: "Energia laranja", detail: "Óculos azuis · acenando", col: 4, row: 0, price: 0 },
  { id: "esportivo-sem-oculos", label: "Esportivo", detail: "Sem óculos · cabelo lateral", col: 0, row: 1, price: 80 },
  { id: "surpreso-roxo", label: "Surpresa roxa", detail: "Óculos azuis · expressão surpresa", col: 1, row: 1, price: 100 },
  { id: "bone-para-tras", label: "Boné para trás", detail: "Óculos azuis · piscando", col: 2, row: 1, price: 120 },
  { id: "jaqueta-azul", label: "Jaqueta azul", detail: "Óculos azuis · sorriso confiante", col: 3, row: 1, price: 140 },
  { id: "universitario", label: "Universitário", detail: "Óculos azuis · jaqueta verde", col: 4, row: 1, price: 160 },
  { id: "estrelas", label: "Céu estrelado", detail: "Óculos azuis · cabelo cacheado", col: 0, row: 2, price: 180 },
  { id: "moletom-amarelo", label: "Sol amarelo", detail: "Óculos azuis · mochila", col: 1, row: 2, price: 200 },
  { id: "azul-focado", label: "Foco azul", detail: "Óculos azuis · braços cruzados", col: 2, row: 2, price: 220 },
  { id: "bone-laranja", label: "Boné laranja", detail: "Óculos azuis · colete teal", col: 3, row: 2, price: 240 },
  { id: "vermelho-pensando", label: "Pensador", detail: "Óculos azuis · moletom vermelho", col: 4, row: 2, price: 260 },
  { id: "agasalho-navy", label: "Campeão navy", detail: "Óculos azuis · agasalho esportivo", col: 0, row: 3, price: 280 },
  { id: "paz-teal", label: "Paz teal", detail: "Óculos azuis · expressão alegre", col: 1, row: 3, price: 300 },
  { id: "aventura-laranja", label: "Aventura", detail: "Óculos azuis · mochila laranja", col: 2, row: 3, price: 320 },
  { id: "raio-amarelo", label: "Raio amarelo", detail: "Óculos azuis · pose divertida", col: 3, row: 3, price: 340 },
  { id: "pijama-estrelas", label: "Pijama estelar", detail: "Óculos azuis · sorriso tranquilo", col: 4, row: 3, price: 360 },
] as const;

const STARTER_AVATARS = new Set(AVATARS.slice(0, 5).map((avatar) => avatar.id));

const DEFAULT_REWARDS: Reward[] = [
  { id: "avatars", title: "Novos avatares", helper: "Desbloquear visuais do Kike", price: 80, icon: Palette, accent: "#8b65d8", action: "avatars" },
  { id: "tablet", title: "30 min no tablet", helper: "Tempo extra aprovado pelos pais", price: 150, icon: Timer, accent: "#3a9ee8", timerMinutes: 30 },
  { id: "sorvete", title: "Tomar um sorvete", helper: "Vale-sorvete em família", price: 220, icon: IceCream, accent: "#f06b83" },
  { id: "roblox", title: "Pontos no Roblox", helper: "Quantidade definida pelos pais", price: 300, icon: Gamepad2, accent: "#36b772" },
];

const RECOMMENDED_TIMERS: Record<string, number> = {
  "manha::Escovar os dentes": 2,
  "banho::Tomar banho": 10,
  "escola::Fazer a lição": 25,
  "estudos::Revisar a matéria": 15,
  "estudos::Fazer os exercícios": 25,
  "refeicoes::Comer com calma": 20,
  "exercicios::Alongar": 5,
  "exercicios::Fazer exercícios": 15,
  "piano::Aquecer os dedos": 5,
  "piano::Praticar a música": 20,
};

function spritePosition(col: number, row: number) {
  return `${col * 25}% ${row * 33.333}%`;
}

function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timerKey(routineId: string, mission: string) {
  return `${routineId}::${mission}`;
}

export default function HomePage() {
  const [routines, setRoutines] = useState<Routine[]>(ROUTINES);
  const [routineId, setRoutineId] = useState("manha");
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [stars, setStars] = useState(245);
  const [balanceDraft, setBalanceDraft] = useState("245");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [parentsOpen, setParentsOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [rewardMessage, setRewardMessage] = useState("Escolha uma recompensa");
  const [missionPoints, setMissionPoints] = useState<Record<string, number>>(() => Object.fromEntries(ROUTINES.map((item) => [item.id, 10])));
  const [timerMinutes, setTimerMinutes] = useState<Record<string, number>>(RECOMMENDED_TIMERS);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const completedTimerIdsRef = useRef(new Set<string>());
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressTab, setProgressTab] = useState<"calendar" | "activities">("calendar");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [activityTotals, setActivityTotals] = useState<ActivityTotal[]>([]);
  const [parentStep, setParentStep] = useState<"pin" | "dashboard">("pin");
  const [parentPin, setParentPin] = useState("");
  const [parentMessage, setParentMessage] = useState("Digite o PIN de 4 números dos responsáveis");
  const [parentTab, setParentTab] = useState<"reviews" | "adventures" | "rewards" | "timers" | "bonus">("reviews");
  const [activityApprovals, setActivityApprovals] = useState<ActivityApproval[]>([]);
  const [reviewingApprovalId, setReviewingApprovalId] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<(typeof AVATARS)[number]["id"]>("classico");
  const [previewAvatarId, setPreviewAvatarId] = useState<(typeof AVATARS)[number]["id"]>("classico");
  const [unlockedAvatars, setUnlockedAvatars] = useState<Set<string>>(() => new Set(STARTER_AVATARS));
  const [avatarMessage, setAvatarMessage] = useState("5 visuais disponíveis · 15 para desbloquear");
  const [avatarPurchasePending, setAvatarPurchasePending] = useState(false);
  const [action, setAction] = useState<"idle" | "wave" | "celebrate">("wave");
  const [showRoutines, setShowRoutines] = useState(true);
  const routine = useMemo(() => routines.find((item) => item.id === routineId) ?? routines[0], [routineId, routines]);
  const selectedAvatar = AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0];
  const previewAvatar = AVATARS.find((item) => item.id === previewAvatarId) ?? AVATARS[0];
  const completedNow = completed[routine.id] ?? [];
  const totalDone = Object.values(completed).reduce((sum, list) => sum + list.length, 0);
  const maxActivityCount = Math.max(1, ...activityTotals.map((item) => Number(item.count)));
  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [calendarMonth]);
  const progressByDay = useMemo(() => new Map(dailyProgress.map((item) => [item.day, item])), [dailyProgress]);
  const timerIsRunning = Boolean(activeTimer?.running && activeTimer.seconds > 0);
  const completeMissionRef = useRef(completeMission);
  completeMissionRef.current = completeMission;

  useEffect(() => {
    const timer = window.setTimeout(() => setAction("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [routineId]);

  useEffect(() => {
    if (!activeTimer?.running || activeTimer.seconds <= 0) return;
    const interval = window.setInterval(() => {
      setActiveTimer((current) => current
        ? { ...current, seconds: Math.max(0, current.seconds - 1), running: current.seconds > 1 }
        : null);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [activeTimer?.running, activeTimer?.seconds]);

  useEffect(() => {
    if (!activeTimer || activeTimer.seconds !== 0 || completedTimerIdsRef.current.has(activeTimer.id)) return;

    const finishedTimer = activeTimer;
    completedTimerIdsRef.current.add(finishedTimer.id);
    window.queueMicrotask(() => {
      setActiveTimer((current) => current?.id === finishedTimer.id ? null : current);
      if (finishedTimer.mission) {
        completeMissionRef.current(finishedTimer.mission);
      } else {
        setAction("celebrate");
        setCelebration({
          title: "Muito bem, Kike!",
          message: `O tempo de “${finishedTimer.label}” terminou. Aproveite sua conquista!`,
          points: 0,
        });
      }
      playCelebrationSound();
    });
  }, [activeTimer, missionPoints, routine.id]);

  useEffect(() => {
    if (!timerIsRunning) return;

    let wakeLock: ScreenWakeLock | null = null;
    let cancelled = false;

    async function keepScreenAwake() {
      if (document.visibilityState !== "visible" || wakeLock || !("wakeLock" in navigator)) return;
      try {
        const manager = (navigator as Navigator & {
          wakeLock: { request: (type: "screen") => Promise<ScreenWakeLock> };
        }).wakeLock;
        const acquiredLock = await manager.request("screen");
        if (cancelled) {
          await acquiredLock.release();
          return;
        }
        wakeLock = acquiredLock;
        acquiredLock.addEventListener("release", () => {
          wakeLock = null;
        });
      } catch {
        // Some browsers or low-power modes may deny Wake Lock; the timer still works normally.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void keepScreenAwake();
    }

    void keepScreenAwake();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock && !wakeLock.released) void wakeLock.release();
    };
  }, [timerIsRunning]);

  useEffect(() => {
    fetch("/api/parent-auth")
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) {
          setParentStep("dashboard");
          setParentMessage("Sessão de responsável restaurada");
          void loadApprovals();
        }
      })
      .catch(() => undefined);

    try {
      const saved = window.localStorage.getItem("kike-game-config");
      if (saved) {
        const config = JSON.parse(saved) as {
          routines?: Routine[];
          rewards?: Reward[];
          missionPoints?: Record<string, number>;
          timerMinutes?: Record<string, number>;
        };
        window.queueMicrotask(() => {
          if (config.routines?.length) {
            setRoutines([
              ...config.routines,
              ...ROUTINES.filter((defaultRoutine) => !config.routines?.some((savedRoutine) => savedRoutine.id === defaultRoutine.id)),
            ]);
          }
          if (config.rewards?.length) setRewards(config.rewards);
          if (config.missionPoints) setMissionPoints(config.missionPoints);
          if (config.timerMinutes) setTimerMinutes({ ...RECOMMENDED_TIMERS, ...config.timerMinutes });
        });
      }
      const savedUnlocks = JSON.parse(window.localStorage.getItem("kike-unlocked-avatars") ?? "[]") as string[];
      const validUnlocks = savedUnlocks.filter((id) => AVATARS.some((avatar) => avatar.id === id));
      if (validUnlocks.length) {
        window.queueMicrotask(() => setUnlockedAvatars(new Set([...STARTER_AVATARS, ...validUnlocks])));
      }
    } catch {
      // Keep the safe defaults when a local draft cannot be read.
    }

    void loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const response = await fetch("/api/progress");
      const data = await response.json() as {
        daily?: Array<{ day: string; earned: number | string; spent: number | string }>;
        activities?: Array<{ activity: string; count: number | string }>;
        balance?: number | string;
      };
      setDailyProgress((data.daily ?? []).map((item) => ({
        day: item.day,
        earned: Number(item.earned),
        spent: Number(item.spent),
      })));
      setActivityTotals((data.activities ?? []).map((item) => ({
        activity: item.activity,
        count: Number(item.count),
      })));
      if (data.balance !== undefined) {
        const balance = Number(data.balance);
        setStars(balance);
        setBalanceDraft(String(balance));
      }
    } catch {
      // The game remains usable if the history service is temporarily offline.
    }
  }

  async function recordProgress(eventType: "mission" | "bonus" | "spent", points: number, activity?: string) {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, points, activity, day: localDay() }),
      });
      const data = await response.json() as { balance?: number };
      if (data.balance !== undefined) {
        setStars(data.balance);
        setBalanceDraft(String(data.balance));
      }
      await loadProgress();
    } catch {
      // Progress can continue locally while a history write retries on the next action.
    }
  }

  async function completeMission(mission: string) {
    if (completedNow.includes(mission)) return;
    const points = missionPoints[routine.id] ?? 10;
    setCompleted((current) => ({
      ...current,
      [routine.id]: [...(current[routine.id] ?? []), mission],
    }));
    setAction("celebrate");
    setCelebration({
      title: "Muito bem, Kike!",
      message: `Você concluiu “${mission}”. Agora um responsável vai revisar a atividade antes de liberar as ${points} estrelas.`,
      points: 0,
    });
    window.setTimeout(() => setAction("idle"), 1600);
    try {
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: mission, routineId: routine.id, points, day: localDay() }),
      });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Não foi possível enviar para revisão");
    } catch (error) {
      setCompleted((current) => ({
        ...current,
        [routine.id]: (current[routine.id] ?? []).filter((item) => item !== mission),
      }));
      setCelebration({
        title: "Tente novamente",
        message: error instanceof Error ? error.message : "Não foi possível enviar a atividade para revisão.",
        points: 0,
      });
    }
  }

  function startMission(mission: string) {
    if (completedNow.includes(mission)) return;
    const minutes = timerMinutes[timerKey(routine.id, mission)] ?? 0;
    if (minutes <= 0) {
      completeMission(mission);
      return;
    }
    setActiveTimer({
      id: crypto.randomUUID(),
      label: mission,
      mission,
      seconds: minutes * 60,
      totalSeconds: minutes * 60,
      running: false,
    });
  }

  function prepareCelebrationAudio() {
    const AudioContextClass = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    audioContextRef.current ??= new AudioContextClass();
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
  }

  function playCelebrationSound() {
    const context = audioContextRef.current;
    if (!context) return;
    void context.resume();
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.setValueAtTime(0.18, now);
    master.connect(context.destination);

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const start = now + index * 0.13;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 3 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.8, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.32);
    });

    [0.62, 0.77, 0.91, 1.04, 1.17].forEach((offset) => {
      const length = Math.floor(context.sampleRate * 0.11);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) {
        samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 2);
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 1500 + Math.random() * 800;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0.7, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.11);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(now + offset);
    });
  }

  function resetDay() {
    setCompleted({});
    setAction("wave");
  }

  function openAvatarPicker() {
    setPreviewAvatarId(avatarId);
    setAvatarMessage("Toque em um visual para experimentar antes de confirmar");
    setAvatarOpen(true);
  }

  function previewAvatarChoice(item: (typeof AVATARS)[number]) {
    setPreviewAvatarId(item.id);
    if (unlockedAvatars.has(item.id)) {
      setAvatarMessage(item.id === avatarId ? `${item.label} está em uso` : `${item.label} disponível para usar`);
      return;
    }
    if (stars < item.price) {
      setAvatarMessage(`Faltam ${item.price - stars} estrelas para desbloquear ${item.label}`);
      return;
    }
    setAvatarMessage(`Confira o visual. Desbloquear custa ${item.price} estrelas.`);
  }

  async function confirmAvatarChoice() {
    const item = previewAvatar;
    if (unlockedAvatars.has(item.id)) {
      setAvatarId(item.id);
      setAvatarMessage(`${item.label} está em uso`);
      setAction("celebrate");
      return;
    }
    if (stars < item.price) {
      setAvatarMessage(`Faltam ${item.price - stars} estrelas para desbloquear ${item.label}`);
      return;
    }

    setAvatarPurchasePending(true);
    setAvatarMessage("Confirmando o desbloqueio…");
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "spent",
          points: item.price,
          activity: `Avatar: ${item.label}`,
          day: localDay(),
        }),
      });
      const data = await response.json() as { balance?: number; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Não foi possível desbloquear");

      const nextUnlocks = new Set([...unlockedAvatars, item.id]);
      setUnlockedAvatars(nextUnlocks);
      window.localStorage.setItem("kike-unlocked-avatars", JSON.stringify([...nextUnlocks]));
      setAvatarId(item.id);
      setStars(Number(data.balance ?? stars - item.price));
      setBalanceDraft(String(data.balance ?? stars - item.price));
      setAvatarMessage(`${item.label} desbloqueado! ${item.price} estrelas foram usadas.`);
      setAction("celebrate");
      await loadProgress();
    } catch (error) {
      setAvatarMessage(error instanceof Error ? error.message : "Não foi possível desbloquear");
      await loadProgress();
    } finally {
      setAvatarPurchasePending(false);
    }
  }

  function redeemReward(item: Reward) {
    if (item.action === "avatars") {
      setRewardsOpen(false);
      openAvatarPicker();
      return;
    }
    if (stars < item.price) {
      setRewardMessage(`Faltam ${item.price - stars} estrelas para ${item.title}`);
      return;
    }
    setStars((value) => value - item.price);
    void recordProgress("spent", item.price, item.title);
    setRewardMessage(`${item.title} resgatado! Peça a confirmação de um responsável.`);
    setAction("celebrate");
    if (item.timerMinutes) {
      setRewardsOpen(false);
      setActiveTimer({
        id: crypto.randomUUID(),
        label: item.title,
        seconds: item.timerMinutes * 60,
        totalSeconds: item.timerMinutes * 60,
        running: false,
      });
    }
  }

  async function loginParent() {
    if (parentPin.length !== 4) {
      setParentMessage("Digite os 4 números do PIN");
      return;
    }
    setParentMessage("Verificando...");
    try {
      const response = await fetch("/api/parent-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: parentPin }),
      });
      const data = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok) throw new Error(data.message ?? "PIN incorreto");
      setParentStep("dashboard");
      setParentPin("");
      setParentMessage("Acesso autorizado");
      setParentTab("reviews");
      await loadApprovals();
    } catch (error) {
      setParentMessage(error instanceof Error ? error.message : "PIN incorreto");
    }
  }

  async function loadApprovals() {
    try {
      const response = await fetch("/api/approvals");
      const data = await response.json() as { approvals?: ActivityApproval[]; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Não foi possível carregar as revisões");
      setActivityApprovals(data.approvals ?? []);
    } catch (error) {
      setParentMessage(error instanceof Error ? error.message : "Não foi possível carregar as revisões");
    }
  }

  async function reviewActivity(id: string, decision: "approve" | "reject") {
    setReviewingApprovalId(id);
    setParentMessage(decision === "approve" ? "Creditando os pontos…" : "Recusando a atividade…");
    try {
      const response = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      const data = await response.json() as { balance?: number; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Não foi possível concluir a revisão");
      if (data.balance !== undefined) {
        setStars(data.balance);
        setBalanceDraft(String(data.balance));
      }
      setParentMessage(decision === "approve" ? "Atividade aprovada e pontos creditados" : "Atividade recusada sem crédito de pontos");
      await Promise.all([loadApprovals(), loadProgress()]);
    } catch (error) {
      setParentMessage(error instanceof Error ? error.message : "Não foi possível concluir a revisão");
    } finally {
      setReviewingApprovalId(null);
    }
  }

  function awardBonus(amount: number) {
    setStars((value) => value + amount);
    void recordProgress("bonus", amount, "Atividade extra");
    setParentMessage(`${amount} estrelas extras adicionadas`);
    setAction("celebrate");
  }

  async function saveBalance() {
    const balance = Math.round(Number(balanceDraft));
    if (!Number.isFinite(balance) || balance < 0 || balance > 999999) {
      setParentMessage("Informe um saldo entre 0 e 999.999");
      return;
    }
    setParentMessage("Corrigindo saldo...");
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-balance", balance }),
      });
      const data = await response.json() as { balance?: number; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Não foi possível corrigir o saldo");
      setStars(data.balance ?? balance);
      setBalanceDraft(String(data.balance ?? balance));
      setParentMessage("Saldo corrigido sem alterar o calendário");
    } catch (error) {
      setParentMessage(error instanceof Error ? error.message : "Não foi possível corrigir o saldo");
    }
  }

  async function clearProgressHistory() {
    if (!window.confirm("Apagar todo o histórico do calendário e do gráfico? O saldo atual será mantido.")) return;
    setParentMessage("Limpando histórico...");
    try {
      const response = await fetch("/api/progress", { method: "DELETE" });
      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Não foi possível limpar o histórico");
      setDailyProgress([]);
      setActivityTotals([]);
      setParentMessage("Histórico de testes apagado. O saldo foi mantido.");
    } catch (error) {
      setParentMessage(error instanceof Error ? error.message : "Não foi possível limpar o histórico");
    }
  }

  async function logoutParent() {
    await fetch("/api/parent-auth", { method: "DELETE" }).catch(() => undefined);
    setParentStep("pin");
    setParentPin("");
    setParentMessage("Sessão encerrada");
  }

  function saveConfiguration() {
    window.localStorage.setItem("kike-game-config", JSON.stringify({ routines, rewards, missionPoints, timerMinutes }));
    setParentMessage("Alterações salvas neste aparelho");
  }

  return (
    <main className="game-shell">
      <div className={`scene ${!showRoutines ? "mission-mode" : ""} ${routineId === "piano" && !showRoutines ? "music-mode" : ""}`} aria-label={routineId === "piano" && !showRoutines ? "Sala de música da Rotina do Kike" : `Cenário de ${routine.label}`}>
        <div className={`world-image ${!showRoutines ? `world-${routineId}` : ""}`} aria-hidden="true" />
        {routineId === "piano" && !showRoutines && (
          <div className="floating-notes" aria-hidden="true">
            <span>♪</span><span>♫</span><span>♩</span><span>♪</span><span>♫</span>
          </div>
        )}
        <div
          className={`character-image-layer ${action}`}
          role="img"
          aria-label="Kike sorrindo e acenando no centro do seu bairro"
          style={{ backgroundPosition: spritePosition(selectedAvatar.col, selectedAvatar.row) }}
        />
        <div className="scene-shade" aria-hidden="true" />

        <header className="top-hud">
          <div className="brand-lockup">
            <div className="brand-star"><Star size={20} fill="currentColor" /></div>
            <div>
              <p>A ROTINA DO</p>
              <strong>KIKE</strong>
            </div>
          </div>
          <button className="progress-pill" onClick={() => { setProgressOpen(true); void loadProgress(); }} aria-label={`Abrir progresso: ${totalDone} missões concluídas`}>
            <Sparkles size={19} />
            <strong>{stars}</strong>
            <div className="progress-track"><span style={{ width: `${Math.min((totalDone / 12) * 100, 100)}%` }} /></div>
            <span>{totalDone}/12</span>
          </button>
          <button className="round-button" onClick={openAvatarPicker} aria-label="Criar ou editar avatar">
            <Palette size={22} />
          </button>
          <button className="round-button reward-nav-button" onClick={() => setRewardsOpen(true)} aria-label="Abrir loja de recompensas">
            <Gift size={22} />
          </button>
          <button className="round-button" onClick={() => setParentsOpen(true)} aria-label="Área dos responsáveis">
            <Settings size={22} />
          </button>
        </header>

        <button className="world-label bath-label" onClick={() => { setRoutineId("banho"); setShowRoutines(false); setAction("wave"); }}>
          <Bath size={21} /> Banho
        </button>
        <button className="world-label study-label" onClick={() => { setRoutineId("escola"); setShowRoutines(false); setAction("wave"); }}>
          <BookOpen size={21} /> Lição
        </button>
        <button className="world-label kitchen-label" onClick={() => { setRoutineId("manha"); setShowRoutines(false); setAction("wave"); }}>
          <Utensils size={21} /> Café
        </button>
        <button className="world-label home-label" onClick={() => { setRoutineId("casa"); setShowRoutines(false); setAction("wave"); }}>
          <Home size={21} /> Casa
        </button>
        <button className="world-label music-label" onClick={() => { setRoutineId("piano"); setShowRoutines(false); setAction("wave"); }}>
          <Music2 size={21} /> Piano
        </button>

        <section className={`mission-dock ${showRoutines ? "expanded" : ""}`} aria-live="polite">
          <div className="dock-heading">
            {!showRoutines && (
              <button className="back-button" onClick={() => setShowRoutines(true)} aria-label="Voltar para as rotinas">
                <ChevronLeft size={22} />
              </button>
            )}
            <div>
              <span>{showRoutines ? "Escolha uma aventura" : routine.helper}</span>
              <h1>{showRoutines ? "O que vamos fazer agora?" : routine.label}</h1>
            </div>
            {!showRoutines && <div className="counter">{completedNow.length}/{routine.missions.length}</div>}
          </div>

          {showRoutines ? (
            <div className="routine-grid">
              {routines.map((item) => {
                const Icon = item.icon;
                const done = (completed[item.id] ?? []).length;
                return (
                  <button
                    className="routine-card"
                    key={item.id}
                    style={{ "--accent": item.accent } as React.CSSProperties}
                    onClick={() => {
                      setRoutineId(item.id);
                      setShowRoutines(false);
                      setAction("wave");
                    }}
                  >
                    <span className="routine-icon"><Icon size={25} /></span>
                    <span><strong>{item.label}</strong><small>{done}/{item.missions.length} missões</small></span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mission-list">
              {routine.missions.map((mission) => {
                const done = completedNow.includes(mission);
                const minutes = timerMinutes[timerKey(routine.id, mission)] ?? 0;
                return (
                  <button className={`mission-button ${done ? "done" : ""}`} key={mission} onClick={() => startMission(mission)}>
                    <span className="mission-check">{done ? <Check size={20} /> : <Plus size={20} />}</span>
                    <span>{mission}{minutes > 0 && <small className="mission-timer"><Clock3 size={12} /> {minutes} min</small>}</span>
                    <span className="mission-reward"><Star size={15} fill="currentColor" /> +{missionPoints[routine.id] ?? 10}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {progressOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setProgressOpen(false)}>
          <section className="game-modal progress-modal" role="dialog" aria-modal="true" aria-labelledby="progress-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setProgressOpen(false)} aria-label="Fechar"><X /></button>
            <span className="eyebrow">MEU PROGRESSO</span>
            <h2 id="progress-title">As conquistas do Kike</h2>
            <div className="progress-tabs" role="tablist">
              <button className={progressTab === "calendar" ? "active" : ""} onClick={() => setProgressTab("calendar")}><CalendarDays size={17} /> Calendário</button>
              <button className={progressTab === "activities" ? "active" : ""} onClick={() => setProgressTab("activities")}><BarChart3 size={17} /> Mais feitas</button>
            </div>

            {progressTab === "calendar" ? (
              <>
                <div className="calendar-heading">
                  <button onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Mês anterior"><ChevronLeft /></button>
                  <strong>{calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong>
                  <button onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Próximo mês"><ChevronRight /></button>
                </div>
                <div className="calendar-weekdays">{["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
                <div className="calendar-grid">
                  {calendarCells.map((day, index) => {
                    if (!day) return <span className="calendar-empty" key={`empty-${index}`} />;
                    const key = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const progress = progressByDay.get(key);
                    return (
                      <div className={`calendar-day ${key === localDay() ? "today" : ""}`} key={key}>
                        <strong>{day}</strong>
                        {progress && progress.earned > 0 && <span className="earned">+{progress.earned}</span>}
                        {progress && progress.spent > 0 && <span className="spent">−{progress.spent}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="calendar-legend"><span className="earned">Ganhou</span><span className="spent">Gastou</span></div>
              </>
            ) : (
              <div className="activity-chart">
                {activityTotals.length === 0 ? (
                  <div className="empty-progress"><BarChart3 size={38} /><strong>As atividades aparecerão aqui</strong><span>Conclua algumas missões para começar o gráfico.</span></div>
                ) : activityTotals.map((item, index) => (
                  <div className="activity-row" key={item.activity}>
                    <span className="activity-rank">{index + 1}</span>
                    <div><strong>{item.activity}</strong><span className="activity-bar"><i style={{ width: `${(item.count / maxActivityCount) * 100}%` }} /></span></div>
                    <b>{item.count}×</b>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTimer && (
        <div className="modal-backdrop timer-backdrop" role="presentation">
          <section className="game-modal timer-modal" role="dialog" aria-modal="true" aria-labelledby="timer-title">
            <button className="modal-close" onClick={() => setActiveTimer(null)} aria-label="Fechar timer"><X /></button>
            <span className="eyebrow">TEMPO DA MISSÃO</span>
            <h2 id="timer-title">{activeTimer.label}</h2>
            <div
              className="timer-ring"
              style={{ "--timer-progress": `${(activeTimer.seconds / activeTimer.totalSeconds) * 360}deg` } as React.CSSProperties}
            >
              <Clock3 size={28} />
              <strong>{String(Math.floor(activeTimer.seconds / 60)).padStart(2, "0")}:{String(activeTimer.seconds % 60).padStart(2, "0")}</strong>
              <span>{activeTimer.seconds === 0 ? "Muito bem!" : activeTimer.running ? "Valendo!" : "Pronto?"}</span>
            </div>
            {activeTimer.seconds > 0 ? (
              <div className="timer-actions">
                <button className="timer-main-action" onClick={() => {
                  if (!activeTimer.running) prepareCelebrationAudio();
                  setActiveTimer((current) => current ? { ...current, running: !current.running } : null);
                }}>
                  {activeTimer.running ? <><Pause /> PAUSAR</> : <><Play /> COMEÇAR</>}
                </button>
                <button className="timer-reset" onClick={() => setActiveTimer((current) => current ? { ...current, seconds: current.totalSeconds, running: false } : null)}><RotateCcw /> Reiniciar</button>
              </div>
            ) : (
              <div className="timer-finishing">Creditando a conquista…</div>
            )}
          </section>
        </div>
      )}

      {celebration && (
        <div className="modal-backdrop celebration-backdrop" role="presentation">
          <section className="game-modal celebration-modal" role="dialog" aria-modal="true" aria-labelledby="celebration-title">
            <div className="celebration-stars" aria-hidden="true"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
            <div className="celebration-trophy"><Trophy size={54} /></div>
            <span className="eyebrow">MISSÃO CONCLUÍDA</span>
            <h2 id="celebration-title">{celebration.title}</h2>
            <p>{celebration.message}</p>
            {celebration.points > 0 && (
              <div className="celebration-points"><Star fill="currentColor" /> +{celebration.points} estrelas</div>
            )}
            <button className="primary-action" onClick={() => setCelebration(null)}>CONTINUAR</button>
          </section>
        </div>
      )}

      {rewardsOpen && (
        <div className="modal-backdrop rewards-backdrop" role="presentation" onMouseDown={() => setRewardsOpen(false)}>
          <section className="game-modal rewards-modal" role="dialog" aria-modal="true" aria-labelledby="rewards-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setRewardsOpen(false)} aria-label="Fechar"><X /></button>
            <span className="eyebrow">LOJA DE RECOMPENSAS</span>
            <div className="store-heading">
              <div>
                <h2 id="rewards-title">Troque suas estrelas</h2>
                <p>{rewardMessage}</p>
              </div>
              <div className="store-balance"><Star size={20} fill="currentColor" /> {stars}</div>
            </div>
            <div className="reward-grid">
              {rewards.map((item) => {
                const Icon = item.icon;
                const affordable = stars >= item.price || item.action === "avatars";
                return (
                  <button
                    key={item.id}
                    className={`store-reward ${affordable ? "" : "unaffordable"}`}
                    style={{ "--reward-accent": item.accent } as React.CSSProperties}
                    onClick={() => redeemReward(item)}
                  >
                    <span className="store-reward-icon"><Icon size={30} /></span>
                    <span className="store-reward-copy"><strong>{item.title}</strong><small>{item.helper}</small></span>
                    <span className="store-reward-price"><Star size={15} fill="currentColor" /> {item.price}</span>
                  </button>
                );
              })}
            </div>
            <p className="parent-confirm-note"><ShieldCheck size={17} /> Prêmios do mundo real precisam da confirmação de um responsável.</p>
          </section>
        </div>
      )}

      {avatarOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAvatarOpen(false)}>
          <section className="game-modal avatar-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setAvatarOpen(false)} aria-label="Fechar"><X /></button>
            <span className="eyebrow">MEU PERSONAGEM</span>
            <h2 id="avatar-title">Escolha o Kike de hoje</h2>
            <div className="avatar-preview">
              <div
                className="avatar-sprite-preview"
                style={{ backgroundPosition: spritePosition(previewAvatar.col, previewAvatar.row) }}
                role="img"
                aria-label={`${previewAvatar.label}: ${previewAvatar.detail}`}
              />
              <div className="avatar-description">
                <strong>{previewAvatar.label}</strong>
                <span>{previewAvatar.detail}</span>
              </div>
            </div>
            <div className="avatar-balance" aria-live="polite">
              <span><Star size={16} fill="currentColor" /> {stars} estrelas</span>
              <span>{avatarMessage}</span>
            </div>
            <div className="avatar-choices" aria-label="Variações do Kike">
              {AVATARS.map((item) => (
                <button
                  key={item.id}
                  className={`${item.id === previewAvatarId ? "selected" : ""} ${unlockedAvatars.has(item.id) ? "" : "locked"}`}
                  onClick={() => previewAvatarChoice(item)}
                  aria-pressed={item.id === previewAvatarId}
                  aria-label={`${item.label}: ${item.detail}${unlockedAvatars.has(item.id) ? "" : `, desbloquear por ${item.price} estrelas`}`}
                >
                  <span
                    className="avatar-choice-image"
                    style={{ backgroundPosition: spritePosition(item.col, item.row) }}
                  />
                  <span className="avatar-choice-label">{item.label}</span>
                  {!unlockedAvatars.has(item.id) && <span className="avatar-price"><Lock size={11} /> {item.price}</span>}
                </button>
              ))}
            </div>
            <div className="avatar-confirmation">
              {!unlockedAvatars.has(previewAvatar.id) && (
                <span className="avatar-confirm-price">
                  Saldo após desbloquear: <strong><Star size={14} fill="currentColor" /> {Math.max(0, stars - previewAvatar.price)}</strong>
                </span>
              )}
              <button
                className="primary-action"
                disabled={avatarPurchasePending || (!unlockedAvatars.has(previewAvatar.id) && stars < previewAvatar.price)}
                onClick={() => void confirmAvatarChoice()}
              >
                {avatarPurchasePending
                  ? "DESBLOQUEANDO…"
                  : unlockedAvatars.has(previewAvatar.id)
                    ? previewAvatar.id === avatarId ? "VISUAL EM USO" : "USAR ESTE VISUAL"
                    : `DESBLOQUEAR POR ${previewAvatar.price}`}
              </button>
            </div>
          </section>
        </div>
      )}

      {parentsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setParentsOpen(false)}>
          <section className={`game-modal parents-modal ${parentStep === "dashboard" ? "parents-dashboard" : ""}`} role="dialog" aria-modal="true" aria-labelledby="parents-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setParentsOpen(false)} aria-label="Fechar"><X /></button>
            <span className="eyebrow">ÁREA DOS RESPONSÁVEIS</span>
            {parentStep === "pin" && (
              <div className="parent-auth">
                <h2 id="parents-title">Entrar como responsável</h2>
                <div className="auth-illustration"><ShieldCheck size={38} /></div>
                <p>Use o PIN de 4 números dos responsáveis. Depois de entrar, este aparelho fica autorizado por 30 dias.</p>
                <label>PIN dos responsáveis<input className="code-input" type="password" inputMode="numeric" autoComplete="current-password" maxLength={4} value={parentPin} onChange={(event) => setParentPin(event.target.value.replace(/\D/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") void loginParent(); }} placeholder="••••" autoFocus /></label>
                <button className="primary-action" onClick={loginParent}>ENTRAR</button>
                <span className="form-message">{parentMessage}</span>
              </div>
            )}
            {parentStep === "dashboard" && (
              <>
                <div className="parent-dashboard-heading">
                  <div><h2 id="parents-title">Configurar o jogo</h2><span><ShieldCheck size={15} /> Acesso protegido por PIN</span></div>
                  <button className="text-action" onClick={logoutParent}>Sair</button>
                </div>
                <div className="parent-tabs" role="tablist">
                  <button className={parentTab === "adventures" ? "active" : ""} onClick={() => setParentTab("adventures")}>Aventuras</button>
                  <button className={parentTab === "reviews" ? "active" : ""} onClick={() => { setParentTab("reviews"); void loadApprovals(); }}>Revisões</button>
                  <button className={parentTab === "rewards" ? "active" : ""} onClick={() => setParentTab("rewards")}>Prêmios</button>
                  <button className={parentTab === "timers" ? "active" : ""} onClick={() => setParentTab("timers")}>Timers</button>
                  <button className={parentTab === "bonus" ? "active" : ""} onClick={() => setParentTab("bonus")}>Pontos extras</button>
                </div>

                {parentTab === "reviews" && (
                  <div className="approval-panel">
                    <div className="approval-heading">
                      <div><strong>Atividades aguardando aprovação</strong><span>Os pontos só entram no saldo depois da sua confirmação.</span></div>
                      <button onClick={() => void loadApprovals()}><RotateCcw size={16} /> Atualizar</button>
                    </div>
                    {activityApprovals.filter((item) => item.status === "pending").length === 0 ? (
                      <div className="approval-empty"><ShieldCheck size={36} /><strong>Tudo revisado!</strong><span>Não há atividades pendentes.</span></div>
                    ) : (
                      <div className="approval-list">
                        {activityApprovals.filter((item) => item.status === "pending").map((item) => (
                          <article className="approval-card" key={item.id}>
                            <div>
                              <span>{routines.find((routineItem) => routineItem.id === item.routine_id)?.label ?? "Atividade"}</span>
                              <strong>{item.activity}</strong>
                              <small>{new Date(item.requested_at).toLocaleString("pt-BR")}</small>
                            </div>
                            <b><Star size={15} fill="currentColor" /> +{item.points}</b>
                            <div className="approval-actions">
                              <button disabled={reviewingApprovalId === item.id} className="reject" onClick={() => void reviewActivity(item.id, "reject")}><X size={17} /> Recusar</button>
                              <button disabled={reviewingApprovalId === item.id} className="approve" onClick={() => void reviewActivity(item.id, "approve")}><Check size={17} /> Aprovar</button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {parentTab === "adventures" && (
                  <div className="config-list">
                    {routines.map((item) => (
                      <div className="config-card" key={item.id}>
                        <div className="config-card-title"><strong>{item.label}</strong><label>Pontos por missão<input type="number" min="1" max="500" value={missionPoints[item.id] ?? 10} onChange={(event) => setMissionPoints((current) => ({ ...current, [item.id]: Number(event.target.value) }))} /></label></div>
                        <label>Nome da aventura<input value={item.label} onChange={(event) => setRoutines((current) => current.map((routineItem) => routineItem.id === item.id ? { ...routineItem, label: event.target.value } : routineItem))} /></label>
                        <label>Missões, uma por linha<textarea value={item.missions.join("\n")} onChange={(event) => setRoutines((current) => current.map((routineItem) => routineItem.id === item.id ? { ...routineItem, missions: event.target.value.split("\n").filter(Boolean) } : routineItem))} /></label>
                      </div>
                    ))}
                    <button className="add-config-button" onClick={() => setRoutines((current) => [...current, { id: `aventura-${Date.now()}`, label: "Nova aventura", helper: "Nova missão", icon: Star, accent: "#ec7d4d", missions: ["Primeira missão"] }])}><Plus size={18} /> Nova aventura</button>
                  </div>
                )}

                {parentTab === "rewards" && (
                  <div className="config-list">
                    {rewards.map((item) => (
                      <div className="config-card reward-config-card" key={item.id}>
                        <label>Nome do prêmio<input value={item.title} onChange={(event) => setRewards((current) => current.map((reward) => reward.id === item.id ? { ...reward, title: event.target.value } : reward))} /></label>
                        <label>Valor em estrelas<input type="number" min="1" value={item.price} onChange={(event) => setRewards((current) => current.map((reward) => reward.id === item.id ? { ...reward, price: Number(event.target.value) } : reward))} /></label>
                        <button className="delete-config" onClick={() => setRewards((current) => current.filter((reward) => reward.id !== item.id))} aria-label={`Excluir ${item.title}`}><Trash2 size={17} /></button>
                      </div>
                    ))}
                    <button className="add-config-button" onClick={() => setRewards((current) => [...current, { id: `premio-${Date.now()}`, title: "Novo prêmio", helper: "Criado pelos responsáveis", price: 100, icon: Gift, accent: "#f2a629" }])}><Plus size={18} /> Novo prêmio</button>
                  </div>
                )}

                {parentTab === "timers" && (
                  <div className="timer-config-panel">
                    <div className="timer-recommendation"><Clock3 size={22} /><div><strong>Timers só quando ajudam</strong><span>Já recomendamos tempo para dentes, banho, lição, alongamento, exercícios e tablet. As outras tarefas ficam sem relógio.</span></div></div>
                    <div className="timer-config-list">
                      {routines.flatMap((routineItem) => routineItem.missions.map((mission) => {
                        const key = timerKey(routineItem.id, mission);
                        const value = timerMinutes[key] ?? 0;
                        return (
                          <label className="timer-config-row" key={key}>
                            <span><strong>{mission}</strong><small>{routineItem.label}</small></span>
                            <span className="timer-input"><input type="number" min="0" max="180" value={value} onChange={(event) => setTimerMinutes((current) => ({ ...current, [key]: Math.max(0, Number(event.target.value)) }))} /> min</span>
                          </label>
                        );
                      }))}
                      {rewards.filter((item) => item.id === "tablet" || item.timerMinutes).map((item) => (
                        <label className="timer-config-row reward-timer-row" key={`reward-${item.id}`}>
                          <span><strong>{item.title}</strong><small>Prêmio com tempo</small></span>
                          <span className="timer-input"><input type="number" min="0" max="180" value={item.timerMinutes ?? 0} onChange={(event) => setRewards((current) => current.map((reward) => reward.id === item.id ? { ...reward, timerMinutes: Math.max(0, Number(event.target.value)) } : reward))} /> min</span>
                        </label>
                      ))}
                    </div>
                    <p className="timer-config-help">Use 0 para deixar a tarefa sem timer.</p>
                  </div>
                )}

                {parentTab === "bonus" && (
                  <div className="bonus-panel">
                    <div className="reward-card"><Sparkles size={28} /><div><span>Saldo atual do Kike</span><strong>{stars} estrelas</strong></div></div>
                    <div className="balance-editor">
                      <label>Corrigir saldo atual<input type="number" min="0" max="999999" inputMode="numeric" value={balanceDraft} onChange={(event) => setBalanceDraft(event.target.value)} /></label>
                      <button onClick={saveBalance}><Save size={17} /> SALVAR SALDO</button>
                      <small>Esta correção não aparece como ganho ou gasto no calendário.</small>
                    </div>
                    <p>Premie uma atividade extra que não estava prevista na rotina.</p>
                    <div className="bonus-grid">
                      {[5, 10, 25, 50].map((amount) => <button key={amount} onClick={() => awardBonus(amount)}><Star size={20} fill="currentColor" /> +{amount}</button>)}
                    </div>
                    <button className="parent-option" onClick={resetDay}><RotateCcw /> <span><strong>Recomeçar o dia</strong><small>Zera o progresso diário</small></span></button>
                    <button className="parent-option danger-option" onClick={clearProgressHistory}><Trash2 /> <span><strong>Limpar histórico de testes</strong><small>Apaga calendário e gráfico, mas mantém o saldo atual</small></span></button>
                  </div>
                )}
                <button className="save-config" onClick={saveConfiguration}><Save size={18} /> SALVAR ALTERAÇÕES</button>
                <span className="form-message">{parentMessage}</span>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
