export default function PageHeader({ title, subtitle, rightAction, showLogo }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100/50 p-4 sticky top-0 z-40">
      <div className="flex justify-between items-center gap-2">
        <div className="flex-1 flex items-center gap-3">
          {showLogo && (
            <img src="/logo.png" alt="Tiffinly" className="h-8 object-contain" />
          )}
          <div>
            <h1 className="font-bold text-xl text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </div>
  );
}
