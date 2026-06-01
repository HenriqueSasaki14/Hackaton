/**
 * Mascote Poussin — pintinho pixel art em SVG puro.
 * Props: size (px), showSign (bool), animate (bool)
 */
export function PoussinMascot({ size = 120, showSign = false, animate = false }) {
  const s = size
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      style={animate ? { animation: 'poussinBounce 2s ease-in-out infinite' } : {}}
    >
      <style>{`
        @keyframes poussinBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes poussinWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>

      {/* Sombra */}
      <ellipse cx="40" cy="74" rx="18" ry="4" fill="rgba(0,0,0,0.1)" />

      {/* Corpo */}
      <ellipse cx="40" cy="52" rx="20" ry="18" fill="#FFD43B" />

      {/* Cabeça */}
      <circle cx="40" cy="32" r="18" fill="#FFD43B" />

      {/* Topo da cabeça (penugem) */}
      <ellipse cx="40" cy="14" rx="5" ry="7" fill="#FFC107" />
      <ellipse cx="33" cy="16" rx="4" ry="6" fill="#FFC107" />
      <ellipse cx="47" cy="16" rx="4" ry="6" fill="#FFC107" />

      {/* Olhos */}
      <circle cx="33" cy="30" r="5" fill="white" />
      <circle cx="47" cy="30" r="5" fill="white" />
      <circle cx="34" cy="31" r="3" fill="#111" />
      <circle cx="48" cy="31" r="3" fill="#111" />
      {/* brilho */}
      <circle cx="35" cy="30" r="1" fill="white" />
      <circle cx="49" cy="30" r="1" fill="white" />

      {/* Bico */}
      <path d="M37 37 L43 37 L40 41 Z" fill="#FF922B" />

      {/* Bochechas */}
      <circle cx="28" cy="36" r="4" fill="#FF9EB5" opacity="0.6" />
      <circle cx="52" cy="36" r="4" fill="#FF9EB5" opacity="0.6" />

      {/* Asas */}
      <ellipse cx="20" cy="52" rx="8" ry="5" fill="#FFC107" transform="rotate(-20 20 52)" />
      <ellipse cx="60" cy="52" rx="8" ry="5" fill="#FFC107" transform="rotate(20 60 52)" />

      {/* Pernas */}
      <rect x="33" y="68" width="5" height="6" rx="2" fill="#FF922B" />
      <rect x="42" y="68" width="5" height="6" rx="2" fill="#FF922B" />

      {/* Pés */}
      <ellipse cx="36" cy="74" rx="5" ry="2" fill="#FF922B" />
      <ellipse cx="44" cy="74" rx="5" ry="2" fill="#FF922B" />

      {showSign && (
        <g transform="translate(44, 18)">
          {/* Cabo da placa */}
          <rect x="10" y="10" width="3" height="20" rx="1" fill="#8B5E3C" />
          {/* Placa */}
          <rect x="0" y="0" width="32" height="18" rx="3" fill="#8B5E3C" />
          <rect x="1" y="1" width="30" height="16" rx="2" fill="#FFF9DB" />
          <text x="16" y="8" textAnchor="middle" fontSize="4" fontWeight="900" fill="#111" fontFamily="Nunito,sans-serif">Poussin</text>
          <text x="16" y="13" textAnchor="middle" fontSize="4" fontWeight="900" fill="#FFB300" fontFamily="Nunito,sans-serif">Learning</text>
        </g>
      )}
    </svg>
  )
}
