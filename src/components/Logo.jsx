export default function Logo({ size = 40, showSubtitle = true, className = '' }) {
  const iconSize = size
  const textSize = size >= 40 ? 'text-lg' : 'text-sm'
  const subtitleSize = size >= 40 ? 'text-xs' : 'text-[10px]'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 192 192"
          className="text-white"
          style={{ width: iconSize * 0.55, height: iconSize * 0.55 }}
          fill="none"
        >
          <defs>
            <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          <path
            d="M24 120 H54 L64 58 L74 148 L82 120 H98"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M98 120 Q108 112 116 106"
            stroke="url(#neural-grad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <circle cx="124" cy="100" r="5" fill="#22d3ee" />
          <circle cx="124" cy="100" r="9" fill="#22d3ee" opacity="0.2" />

          <path
            d="M129 100 Q140 106 152 104"
            stroke="#22d3ee"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.6"
          />

          <circle cx="160" cy="102" r="4" fill="#22d3ee" />
          <circle cx="160" cy="102" r="7" fill="#22d3ee" opacity="0.15" />

          <line
            x1="164" y1="102" x2="174" y2="92"
            stroke="#22d3ee"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.5"
          />

          <circle cx="179" cy="90" r="3" fill="#22d3ee" />

          <circle cx="148" cy="42" r="3" fill="#22d3ee" opacity="0.6" />
          <circle cx="148" cy="42" r="6" fill="#22d3ee" opacity="0.15" />
        </svg>
      </div>

      <div>
        <h1 className={`${textSize} font-bold tracking-tight text-white flex items-center gap-1.5`}>
          Fisio<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI</span>
        </h1>
        {showSubtitle && (
          <p className={`${subtitleSize} text-slate-400 font-medium`}>Assistente de Fisiologia</p>
        )}
      </div>
    </div>
  )
}
