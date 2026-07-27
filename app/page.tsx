"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bath,
  BookOpen,
  Check,
  ChevronLeft,
  Dumbbell,
  Gift,
  Home,
  Palette,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Sun,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

type AvatarOptions = {
  skin: string;
  hair: string;
  shirt: string;
  shorts: string;
};

type Routine = {
  id: string;
  label: string;
  helper: string;
  icon: typeof Sun;
  accent: string;
  missions: string[];
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

const DEFAULT_AVATAR: AvatarOptions = {
  skin: "#f2ad77",
  hair: "#4a2719",
  shirt: "#18a9aa",
  shorts: "#244d79",
};

function Avatar3D({
  options,
  action,
}: {
  options: AvatarOptions;
  action: "idle" | "wave" | "celebrate";
}) {
  const root = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const hair = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!root.current || !leftArm.current || !rightArm.current || !leftLeg.current || !rightLeg.current) return;
    const t = clock.elapsedTime;
    const settle = Math.min(delta * 8, 1);
    root.current.position.y = -1.22 + Math.sin(t * 2) * 0.035;
    root.current.rotation.y += ((action === "celebrate" ? Math.sin(t * 5) * 0.25 : 0) - root.current.rotation.y) * settle;
    const wave = action === "wave" ? -1.9 + Math.sin(t * 8) * 0.28 : action === "celebrate" ? -2.35 : -0.12;
    rightArm.current.rotation.z += (wave - rightArm.current.rotation.z) * settle;
    leftArm.current.rotation.z += ((action === "celebrate" ? 2.35 : 0.12) - leftArm.current.rotation.z) * settle;
    leftLeg.current.rotation.x = Math.sin(t * 2) * 0.035;
    rightLeg.current.rotation.x = -Math.sin(t * 2) * 0.035;
    if (hair.current) hair.current.rotation.y = Math.sin(t * 1.5) * 0.02;
  });

  return (
    <group ref={root} scale={1.02}>
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.58, 32, 24]} />
        <meshStandardMaterial color={options.skin} roughness={0.72} />
      </mesh>
      <mesh ref={hair} position={[0, 1.32, -0.04]} scale={[1.04, 0.62, 1.03]}>
        <sphereGeometry args={[0.6, 18, 12]} />
        <meshStandardMaterial color={options.hair} roughness={0.9} />
      </mesh>
      <mesh position={[-0.22, 1.03, 0.51]} scale={[0.88, 1.15, 0.42]}>
        <sphereGeometry args={[0.09, 18, 12]} />
        <meshStandardMaterial color="#241c2e" />
      </mesh>
      <mesh position={[0.22, 1.03, 0.51]} scale={[0.88, 1.15, 0.42]}>
        <sphereGeometry args={[0.09, 18, 12]} />
        <meshStandardMaterial color="#241c2e" />
      </mesh>
      <mesh position={[-0.22, 1.05, 0.57]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.22, 1.05, 0.57]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0.83, 0.54]} scale={[1.5, 0.6, 0.45]}>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshStandardMaterial color="#842b2d" />
      </mesh>

      <mesh position={[0, 0.1, 0]} scale={[0.82, 1, 0.52]}>
        <capsuleGeometry args={[0.52, 0.68, 10, 18]} />
        <meshStandardMaterial color={options.shirt} roughness={0.78} />
      </mesh>
      <mesh position={[0, -0.45, 0.02]} scale={[0.88, 0.45, 0.56]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={options.shorts} roughness={0.8} />
      </mesh>

      <group ref={leftArm} position={[-0.53, 0.35, 0]} rotation={[0, 0, 0.12]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.14, 0.5, 8, 14]} />
          <meshStandardMaterial color={options.shirt} />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <sphereGeometry args={[0.16, 18, 12]} />
          <meshStandardMaterial color={options.skin} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.53, 0.35, 0]} rotation={[0, 0, -0.12]}>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.14, 0.5, 8, 14]} />
          <meshStandardMaterial color={options.shirt} />
        </mesh>
        <mesh position={[0, -0.7, 0]}>
          <sphereGeometry args={[0.16, 18, 12]} />
          <meshStandardMaterial color={options.skin} />
        </mesh>
      </group>

      <group ref={leftLeg} position={[-0.25, -0.75, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.17, 0.55, 8, 14]} />
          <meshStandardMaterial color={options.skin} />
        </mesh>
        <mesh position={[0, -0.78, 0.12]} scale={[1, 0.55, 1.45]}>
          <sphereGeometry args={[0.22, 18, 12]} />
          <meshStandardMaterial color="#ecf7f5" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.25, -0.75, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.17, 0.55, 8, 14]} />
          <meshStandardMaterial color={options.skin} />
        </mesh>
        <mesh position={[0, -0.78, 0.12]} scale={[1, 0.55, 1.45]}>
          <sphereGeometry args={[0.22, 18, 12]} />
          <meshStandardMaterial color="#ecf7f5" />
        </mesh>
      </group>
    </group>
  );
}

function WorldCanvas({
  avatar,
  action,
}: {
  avatar: AvatarOptions;
  action: "idle" | "wave" | "celebrate";
}) {
  return (
    <Canvas
      className="world-canvas"
      camera={{ position: [0, 0.5, 6.7], fov: 31 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={2.2} />
      <directionalLight position={[4, 7, 6]} intensity={2.4} color="#fff5dd" />
      <directionalLight position={[-4, 2, 2]} intensity={0.7} color="#a5eaff" />
      <Avatar3D options={avatar} action={action} />
    </Canvas>
  );
}

export default function HomePage() {
  const [routineId, setRoutineId] = useState("manha");
  const [completed, setCompleted] = useState<Record<string, string[]>>({});
  const [stars, setStars] = useState(245);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [parentsOpen, setParentsOpen] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [action, setAction] = useState<"idle" | "wave" | "celebrate">("wave");
  const [showRoutines, setShowRoutines] = useState(true);
  const routine = useMemo(() => ROUTINES.find((item) => item.id === routineId) ?? ROUTINES[0], [routineId]);
  const completedNow = completed[routine.id] ?? [];
  const totalDone = Object.values(completed).reduce((sum, list) => sum + list.length, 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAction("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [routineId]);

  function completeMission(mission: string) {
    if (completedNow.includes(mission)) return;
    setCompleted((current) => ({
      ...current,
      [routine.id]: [...(current[routine.id] ?? []), mission],
    }));
    setStars((value) => value + 10);
    setAction("celebrate");
    window.setTimeout(() => setAction("idle"), 1600);
  }

  function resetDay() {
    setCompleted({});
    setStars(245);
    setAction("wave");
  }

  return (
    <main className="game-shell">
      <div className="scene" aria-label="Mundo da Rotina do Kike">
        <div className="world-image" aria-hidden="true" />
        <WorldCanvas avatar={avatar} action={action} />
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
              {ROUTINES.map((item) => {
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
                    <span className="mission-reward"><Star size={15} fill="currentColor" /> +10</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {avatarOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAvatarOpen(false)}>
          <section className="game-modal avatar-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setAvatarOpen(false)} aria-label="Fechar"><X /></button>
            <span className="eyebrow">MEU PERSONAGEM</span>
            <h2 id="avatar-title">Crie o avatar do Kike</h2>
            <div className="avatar-preview"><WorldCanvas avatar={avatar} action="wave" /></div>
            <AvatarPicker label="Tom de pele" values={["#f7c49a", "#e8a16d", "#bd754e", "#75452f"]} value={avatar.skin} onChange={(skin) => setAvatar({ ...avatar, skin })} />
            <AvatarPicker label="Cabelo" values={["#3c2118", "#8a4c22", "#d2a03e", "#18181c"]} value={avatar.hair} onChange={(hair) => setAvatar({ ...avatar, hair })} />
            <AvatarPicker label="Camiseta" values={["#18a9aa", "#4a8fe7", "#f06a5f", "#9564dc", "#4fc56a"]} value={avatar.shirt} onChange={(shirt) => setAvatar({ ...avatar, shirt })} />
            <button className="primary-action" onClick={() => { setAvatarOpen(false); setAction("celebrate"); }}>PRONTO!</button>
          </section>
        </div>
      )}

      {parentsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setParentsOpen(false)}>
          <section className="game-modal parents-modal" role="dialog" aria-modal="true" aria-labelledby="parents-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setParentsOpen(false)} aria-label="Fechar"><X /></button>
            <span className="eyebrow">ÁREA DOS RESPONSÁVEIS</span>
            <h2 id="parents-title">Rotinas e recompensas</h2>
            <div className="reward-card"><Gift size={28} /><div><span>Próximo prêmio</span><strong>Escolher o filme · 300 ⭐</strong></div></div>
            <button className="parent-option"><Plus /> <span><strong>Nova rotina</strong><small>Crie tarefas e horários</small></span></button>
            <button className="parent-option"><Gift /> <span><strong>Novo prêmio</strong><small>Cadastre uma recompensa</small></span></button>
            <button className="parent-option" onClick={resetDay}><RotateCcw /> <span><strong>Recomeçar o dia</strong><small>Zera apenas este protótipo</small></span></button>
          </section>
        </div>
      )}
    </main>
  );
}

function AvatarPicker({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="avatar-picker">
      <span>{label}</span>
      <div>
        {values.map((color) => (
          <button
            key={color}
            className={color === value ? "selected" : ""}
            style={{ background: color }}
            onClick={() => onChange(color)}
            aria-label={`${label}: opção ${color}`}
            aria-pressed={color === value}
          />
        ))}
      </div>
    </div>
  );
}
