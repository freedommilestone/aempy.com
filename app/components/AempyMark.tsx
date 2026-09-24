export default function AempyMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 52" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="logo-left" x1="9" y1="45" x2="29" y2="8" gradientUnits="userSpaceOnUse"><stop stopColor="#6234f5"/><stop offset=".55" stopColor="#8e73ff"/><stop offset="1" stopColor="#74baff"/></linearGradient>
              <linearGradient id="logo-right" x1="23" y1="10" x2="39" y2="45" gradientUnits="userSpaceOnUse"><stop stopColor="#668cff"/><stop offset=".55" stopColor="#5134b5"/><stop offset="1" stopColor="#9362ff"/></linearGradient>
            </defs>
            <path d="m8 44 16-34" stroke="url(#logo-left)" strokeWidth="12" strokeLinecap="round"/>
            <path d="m24 10 16 34" stroke="url(#logo-right)" strokeWidth="12" strokeLinecap="round"/>
            <path d="m13 35 15 5" stroke="#7757ee" strokeWidth="10" strokeLinecap="round"/>
            <path d="m8 44 5-9" stroke="#5934e6" strokeWidth="11" strokeLinecap="round"/>
          </svg>
  );
}
