import { useMemo, useState } from 'react';
import { useSubsData } from '../../hooks/useSubsData';
import { HistoricalSubmissionsSkeleton } from '../ChartPlaceholders';
import { COLORS } from '../../lib/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from '../../css/SubmissionsOverTimeChart.module.css';

const CustomTooltip = ({ active, payload, label, isCumulative }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const dateObj = data.dateObj as Date;
    const dateLabel = dateObj ? `${dateObj.getFullYear()} 年 ${dateObj.getMonth() + 1} 月` : label;
    const totalCount = isCumulative ? data.cumulativeCount : data.count;
    const sitesData: Record<string, number> = isCumulative ? data.cumulativeWebsites : data.websites;

    const sites = Object.entries(sitesData)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipDate}>
          {dateLabel}
        </div>
        {sites.length > 0 ? (
          <div className={styles.tooltipSites}>
            {sites.map(([site, count]) => (
              <div key={site} className={styles.tooltipSiteRow}>
                <div className={styles.tooltipSiteLabel}>
                  <div
                    className={styles.tooltipSiteDot}
                    style={{ '--dot-color': COLORS[site] || '#8E44AD' } as React.CSSProperties}
                  />
                  <span className={styles.tooltipSiteName}>{site}</span>
                </div>
                <span className={styles.tooltipSiteCount}>{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.tooltipEmpty}>無提交紀錄</div>
        )}
        <div className={styles.tooltipTotal}>
          <span className={styles.tooltipTotalLabel}>總計</span>
          <span
            className={styles.tooltipTotalValue}
            style={{ '--total-color': isCumulative ? '#10b981' : '#3b82f6' } as React.CSSProperties}
          >
            {totalCount}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SubmissionsOverTimeChart() {
  const { rawData, filteredData, loading, error } = useSubsData();
  const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('monthly');

  const chartData = useMemo(() => {
    const dataSource = filteredData || rawData;
    if (!dataSource || dataSource.length === 0) return [];

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (rawData) {
      rawData.forEach((sub) => {
        const dateStr = sub['完成時間'];
        if (!dateStr) return;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;

        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      });
    }

    const countsByMonth = new Map<string, { total: number, websites: Record<string, number> }>();

    dataSource.forEach((sub) => {
      const dateStr = sub['完成時間'];
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const site = sub['網站'] || 'Unknown';

      const entry = countsByMonth.get(key) || { total: 0, websites: {} };
      entry.total += 1;
      entry.websites[site] = (entry.websites[site] || 0) + 1;
      countsByMonth.set(key, entry);
    });

    if (!minDate || !maxDate) return [];

    const minD = minDate as Date;
    const maxD = maxDate as Date;

    const data = [];
    let cumulative = 0;
    let cumulativeWebsites: Record<string, number> = {};
    const current = new Date(minD.getFullYear(), minD.getMonth(), 1);
    const end = new Date(maxD.getFullYear(), maxD.getMonth(), 1);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const monthData = countsByMonth.get(key) || { total: 0, websites: {} };

      cumulative += monthData.total;

      Object.entries(monthData.websites).forEach(([site, count]) => {
        cumulativeWebsites[site] = (cumulativeWebsites[site] || 0) + count;
      });

      data.push({
        name: key, // YYYY-MM
        dateObj: new Date(current),
        count: monthData.total,
        cumulativeCount: cumulative,
        websites: { ...monthData.websites },
        cumulativeWebsites: { ...cumulativeWebsites },
      });
      current.setMonth(current.getMonth() + 1);
    }

    return data;
  }, [rawData, filteredData]);

  if (loading) {
    return <HistoricalSubmissionsSkeleton />;
  }
  if (error) {
    return <div className={`chart-card dashboard-item ${styles.error}`}>Error: {error}</div>;
  }

  const dataSource = filteredData || rawData;
  const totalSubmissions = dataSource ? dataSource.length : 0;
  const isCumulative = viewMode === 'cumulative';

  return (
    <div className={`chart-card dashboard-item ${styles.card}`}>
      <div className={styles.chartHeader}>
        <div className={styles.chartHeaderLeft}>
          <h2 className={`chart-title ${styles.chartTitle}`}>歷年提交量</h2>
          <div className={styles.toggleGroup}>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('monthly'); }}
              className={!isCumulative ? styles.toggleBtnActive : styles.toggleBtn}
            >
              單月
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode('cumulative'); }}
              className={isCumulative ? styles.toggleBtnActive : styles.toggleBtn}
            >
              累計
            </button>
          </div>
        </div>
        <div className={styles.totalDisplay}>
          <span className={styles.totalNumber}>
            {totalSubmissions.toLocaleString()}
          </span>
          <span className={styles.totalLabel}>
            總提交量
          </span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSubmissionsCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={true} />
            <XAxis
              dataKey="name"
              ticks={chartData.filter(d => d.dateObj.getMonth() === 0).map(d => d.name)}
              tickFormatter={(val: string) => {
                const year = val.split('-')[0];
                return `${year}年`;
              }}
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip isCumulative={isCumulative} />} />
            <Area
              type="monotone"
              dataKey={isCumulative ? "cumulativeCount" : "count"}
              name={isCumulative ? "累計提交量" : "單月提交量"}
              stroke={isCumulative ? "#10b981" : "#3b82f6"}
              strokeWidth={3}
              fillOpacity={1}
              fill={isCumulative ? "url(#colorSubmissionsCumulative)" : "url(#colorSubmissions)"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
