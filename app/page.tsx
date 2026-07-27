"use client";

import {
  Bath,
  BookOpen,
  Check,
  ChevronLeft,
  Dumbbell,
  Gift,
  Gamepad2,
  Home,
  IceCream,
  Lock,
  Palette,
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
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  { id: "tablet", title: "30 min no tablet", helper: "Tempo extra aprovado pelos pais", price: 150, icon: Timer, accent: "#3a9ee8" },
  { id: "sorvete", title: "Tomar um sorvete", helper: "Vale-sorvete em família", price: 220, icon: IceCream, accent: "#f06b83" },
  { id: "roblox", title: "Pontos no Roblox", helper: "Quantidade definida pelos pais", price: 300, icon: Gamepad2, accent: "#36b772" },
];

function spritePosition(col: number, row: number) {
  return `${col * 25}% ${row * 33.333}%`;
}

export default function HomePage() {
  const [routines, setRoutines] = useState<Routine[]>(ROUTINES);
  const [routineId, setRoutineId] = useState("manha");
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [stars, setStars] = useState(245);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [parentsOpen, setParentsOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [rewardMessage, setRewardMessage] = useState("Escolha uma recompensa");
  const [missionPoints, setMissionPoints] = useState<Record<string, number>>(() => Object.fromEntries(ROUTINES.map((item) => [item.id, 10])));
  const [parentStep, setParentStep] = useState<"pin" | "dashboard">("pin");
  const [parentPin, setParentPin] = useState("");
  const [parentMessage, setParentMessage] = useState("Digite o PIN de 4 números dos responsáveis");
  const [parentTab, setParentTab] = useState<"adventures" | "rewards" | "bonus">("adventures");
  const [avatarId, setAvatarId] = useState<(typeof AVATARS)[number]["id"]>("classico");
  const [unlockedAvatars, setUnlockedAvatars] = useState<Set<string>>(() => new Set(STARTER_AVATARS));
  const [avatarMessage, setAvatarMessage] = useState("5 visuais disponíveis · 15 para desbloquear");
  const [action, setAction] = useState<"idle" | "wave" | "celebrate">("wave");
  const [showRoutines, setShowRoutines] = useState(true);
  const routine = useMemo(() => routines.find((item) => item.id === routineId) ?? routines[0], [routineId, routines]);
  const selectedAvatar = AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0];
  const completedNow = completed[routine.id] ?? [];
  const totalDone = Object.values(completed).reduce((sum, list) => sum + list.length, 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAction("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [routineId]);

  useEffect(() => {
    fetch("/api/parent-auth")
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => {
        if (data.authenticated) {
          setParentStep("dashboard");
          setParentMessage("Sessão de responsável restaurada");
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
        };
        if (config.routines?.length) setRoutines(config.routines);
        if (config.rewards?.length) setRewards(config.rewards);
        if (config.missionPoints) setMissionPoints(config.missionPoints);
      }
    } catch {
      // Keep the safe defaults when a local draft cannot be read.
    }
  }, []);

  function completeMission(mission: string) {
    if (completedNow.includes(mission)) return;
    setCompleted((current) => ({
      ...current,
      [routine.id]: [...(current[routine.id] ?? []), mission],
    }));
    setStars((value) => value + (missionPoints[routine.id] ?? 10));
    setAction("celebrate");
    window.setTimeout(() => setAction("idle"), 1600);
  }

  function resetDay() {
    setCompleted({});
    setStars(245);
    setAction("wave");
  }

  function chooseAvatar(item: (typeof AVATARS)[number]) {
    if (unlockedAvatars.has(item.id)) {
      setAvatarId(item.id);
      setAvatarMessage(`${item.label} selecionado`);
      return;
    }
    if (stars < item.price) {
      setAvatarMessage(`Faltam ${item.price - stars} estrelas para desbloquear ${item.label}`);
      return;
    }
    setStars((value) => value - item.price);
    setUnlockedAvatars((current) => new Set([...current, item.id]));
    setAvatarId(item.id);
    setAvatarMessage(`${item.label} desbloqueado!`);
    setAction("celebrate");
  }

  function redeemReward(item: Reward) {
    if (item.action === "avatars") {
      setRewardsOpen(false);
      setAvatarOpen(true);
      return;
    }
    if (stars < item.price) {
      setRewardMessage(`Faltam ${item.price - stars} estrelas para ${item.title}`);
      return;
    }
    setStars((value) => value - item.price);
    setRewardMessage(`${item.title} resgatado! Peça a confirmação de um responsável.`);
    setAction("celebrate");
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
    } catch (error) {
      setParentMessage(error instanceof Error ? error.message : "PIN incorreto");
    }
  }

  function awardBonus(amount: number) {
    setStars((value) => value + amount);
    setParentMessage(`${amount} estrelas extras adicionadas`);
    setAction("celebrate");
  }

  async function logoutParent() {
    await fetch("/api/parent-auth", { method: "DELETE" }).catch(() => undefined);
    setParentStep("pin");
    setParentPin("");
    setParentMessage("Sessão encerrada");
  }

  function saveConfiguration() {
    window.localStorage.setItem("kike-game-config", JSON.stringify({ routines, rewards, missionPoints }));
    setParentMessage("Alterações salvas neste aparelho");
  }

  return (
    <main className="game-shell">
      <div className="scene" aria-label="Mundo da Rotina do Kike">
        <div className="world-image" aria-hidden="true" />
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
          <div className="progress-pill" aria-label={`${totalDone} missões concluídas`}>
            <Sparkles size={19} />
            <strong>{stars}</strong>
            <div className="progress-track"><span style={{ width: `${Math.min((totalDone / 12) * 100, 100)}%` }} /></div>
            <span>{totalDone}/12</span>
          </div>
          <button className="round-button" onClick={() => setAvatarOpen(true)} aria-label="Criar ou editar avatar">
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
                return (
                  <button className={`mission-button ${done ? "done" : ""}`} key={mission} onClick={() => completeMission(mission)}>
                    <span className="mission-check">{done ? <Check size={20} /> : <Plus size={20} />}</span>
                    <span>{mission}</span>
                    <span className="mission-reward"><Star size={15} fill="currentColor" /> +{missionPoints[routine.id] ?? 10}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

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
                style={{ backgroundPosition: spritePosition(selectedAvatar.col, selectedAvatar.row) }}
                role="img"
                aria-label={`${selectedAvatar.label}: ${selectedAvatar.detail}`}
              />
              <div className="avatar-description">
                <strong>{selectedAvatar.label}</strong>
                <span>{selectedAvatar.detail}</span>
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
                  className={`${item.id === avatarId ? "selected" : ""} ${unlockedAvatars.has(item.id) ? "" : "locked"}`}
                  onClick={() => chooseAvatar(item)}
                  aria-pressed={item.id === avatarId}
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
            <button className="primary-action" onClick={() => { setAvatarOpen(false); setAction("celebrate"); }}>PRONTO!</button>
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
                  <button className={parentTab === "rewards" ? "active" : ""} onClick={() => setParentTab("rewards")}>Prêmios</button>
                  <button className={parentTab === "bonus" ? "active" : ""} onClick={() => setParentTab("bonus")}>Pontos extras</button>
                </div>

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

                {parentTab === "bonus" && (
                  <div className="bonus-panel">
                    <div className="reward-card"><Sparkles size={28} /><div><span>Saldo atual do Kike</span><strong>{stars} estrelas</strong></div></div>
                    <p>Premie uma atividade extra que não estava prevista na rotina.</p>
                    <div className="bonus-grid">
                      {[5, 10, 25, 50].map((amount) => <button key={amount} onClick={() => awardBonus(amount)}><Star size={20} fill="currentColor" /> +{amount}</button>)}
                    </div>
                    <button className="parent-option" onClick={resetDay}><RotateCcw /> <span><strong>Recomeçar o dia</strong><small>Zera o progresso diário</small></span></button>
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
