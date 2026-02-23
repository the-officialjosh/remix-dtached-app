import { cn } from '../lib/utils';

const FieldMap = ({ activeField, tournamentType }: { activeField?: string; tournamentType: '7v7' | 'Flag' }) => {
  const fields = tournamentType === '7v7' 
    ? [
        { name: 'Field 1', x: 10, y: 20 },
        { name: 'Field 2', x: 50, y: 20 },
        { name: 'Field 3', x: 10, y: 60 },
        { name: 'Field 4', x: 50, y: 60 },
      ]
    : [
        { name: 'Field 3', x: 10, y: 20 },
        { name: 'Field 4', x: 50, y: 20 },
        { name: 'Field 5', x: 30, y: 60 },
      ];

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-64 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute border-l border-zinc-500" style={{ left: `${i * 5}%`, top: 0, bottom: 0 }} />
        ))}
      </div>
      {fields.map(field => (
        <div
          key={field.name}
          className={cn(
            "absolute w-32 h-16 rounded-2xl border-2 flex items-center justify-center transition-all",
            activeField === field.name 
              ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              : "border-zinc-700 bg-zinc-800/50"
          )}
          style={{ left: `${field.x}%`, top: `${field.y}%` }}
        >
          <span className={cn(
            "text-xs font-bold uppercase tracking-widest",
            activeField === field.name ? "text-yellow-500" : "text-zinc-500"
          )}>
            {field.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FieldMap;
