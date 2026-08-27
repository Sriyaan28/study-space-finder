import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend = null,
}) => {
  const colorMap = {
    indigo: { bg: 'var(--indigo-50)', text: 'var(--indigo-600)', border: 'rgba(99, 102, 241, 0.2)' },
    emerald: { bg: 'var(--emerald-50)', text: 'var(--emerald-600)', border: 'rgba(16, 185, 129, 0.2)' },
    amber: { bg: 'var(--amber-50)', text: 'var(--amber-600)', border: 'rgba(245, 158, 11, 0.2)' },
    rose: { bg: 'var(--rose-50)', text: 'var(--rose-600)', border: 'rgba(244, 63, 94, 0.2)' },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: scheme.bg, color: scheme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: trend.isPositive ? 'var(--emerald-600)' : 'var(--rose-600)' }}>
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default StatCard;
