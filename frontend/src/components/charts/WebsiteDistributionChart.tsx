import { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSubsData } from '../../hooks/useSubsData';
import { WebsiteDistributionSkeleton } from '../ChartPlaceholders';
import styles from '../../css/WebsiteDistributionChart.module.css';

import { COLORS, DEFAULT_COLOR } from '../../lib/constants';

const TOOLTIP_CONTENT_STYLE = { backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' };
const TOOLTIP_ITEM_STYLE = { color: '#F8FAFC' };

const CELL_STYLE_BASE = {
  cursor: 'pointer',
  outline: 'none',
  transformOrigin: 'center',
  transition: 'all 0.1s ease'
};

const getLogoPath = (name: string) => `./OJ logos/${name}.png`;

const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius * 1.15) * cos;
  const my = cy + (outerRadius * 1.15) * sin;

  const isRight = cos >= 0;
  const ex = mx + (isRight ? 1 : -1) * 15;

  const fWidth = 250;
  const fHeight = 40;
  const fX = isRight ? ex + 5 : ex - fWidth - 5;
  const fY = my - fHeight / 2;

  return (
    <g>
      <path d={`M${sx},${sy} L${mx},${my} L${ex},${my}`} stroke={fill} fill="none" strokeWidth={3} />
      <foreignObject x={fX} y={fY} width={fWidth} height={fHeight}>
        <div
          className={styles.pieLabel}
          style={{
            justifyContent: isRight ? 'flex-start' : 'flex-end',
            '--label-color': fill,
          } as React.CSSProperties}
        >
          <img src={getLogoPath(name)} alt={name} className={styles.pieLabelLogo} />
          <span>{`${name} (${(percent * 100).toFixed(0)}%)`}</span>
        </div>
      </foreignObject>
    </g>
  );
};

const renderMobileLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill }: any) => {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius * 1.15) * cos;
  const my = cy + (outerRadius * 1.15) * sin;

  const isRight = cos >= 0;
  const ex = mx + (isRight ? 1 : -1) * 10;

  const fWidth = 150;
  const fHeight = 28;
  const fX = isRight ? ex + 4 : ex - fWidth - 4;
  const fY = my - fHeight / 2;

  return (
    <g>
      <path d={`M${sx},${sy} L${mx},${my} L${ex},${my}`} stroke={fill} fill="none" strokeWidth={2} />
      <foreignObject x={fX} y={fY} width={fWidth} height={fHeight}>
        <div
          className={styles.pieLabelMobile}
          style={{
            justifyContent: isRight ? 'flex-start' : 'flex-end',
            '--label-color': fill,
          } as React.CSSProperties}
        >
          <img src={getLogoPath(name)} alt={name} className={styles.pieLabelLogoMobile} />
          <span>{`${name} (${(percent * 100).toFixed(0)}%)`}</span>
        </div>
      </foreignObject>
    </g>
  );
};

export default function WebsiteDistributionChart() {
  const { rawData, loading, error, selectedWebsite, selectedVerdict, setWebsiteFilter } = useSubsData();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => {
    if (!rawData) return [];
    const counts: Record<string, number> = {};

    // Cross-filtering: Filter by the other dimension (verdict) if selected
    const filteredRaw = selectedVerdict
      ? rawData.filter(sub => sub['結果'] === selectedVerdict)
      : rawData;

    filteredRaw.forEach(sub => {
      const site = sub['網站'] || 'Unknown';
      counts[site] = (counts[site] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [rawData, selectedVerdict]);

  if (loading) {
    return <WebsiteDistributionSkeleton />;
  }

  if (error) {
    return (
      <div className="glass-card col-span-4 skeleton-card">
        <h2 className="skeleton-title">解題網站</h2>
        <div className={styles.errorMessage}>Error loading data</div>
      </div>
    );
  }

  return (
    <div className={`glass-card col-span-4 skeleton-card ${styles.card}`}>
      <h2 className="chart-title">解題網站</h2>
      <div className={`skeleton-content-center ${styles.chartWrapper}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              label={isMobile ? renderMobileLabel : renderCustomizedLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedWebsite === entry.name;
                const isDimmed = selectedWebsite && !isSelected;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || DEFAULT_COLOR}
                    opacity={isDimmed ? 0.3 : 1}
                    style={{
                      ...CELL_STYLE_BASE,
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onClick={(e: any) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      setWebsiteFilter(entry.name);
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              itemStyle={TOOLTIP_ITEM_STYLE}
            />

          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
