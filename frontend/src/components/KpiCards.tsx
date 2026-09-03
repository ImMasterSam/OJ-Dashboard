import styles from '../css/KpiCards.module.css';
import { useSubsData } from '../hooks/useSubsData';

export default function KpiCards() {
  const { data, loading, error } = useSubsData();

  const formatValue = (val: number | undefined) => {
    if (loading) return "...";
    if (error) return "Error";
    if (val === undefined) return "0";
    return val.toLocaleString();
  };

  return (
    <div className={styles.container}>
      <KpiCard label="AC" value={formatValue(data?.ac)} color="var(--color-ac)" />
      <KpiCard label="WA" value={formatValue(data?.wa)} color="var(--color-wa)" />
      <KpiCard label="TLE" value={formatValue(data?.tle)} color="var(--color-tle)" />
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div
      className={`glass-card ${styles.card}`}
      style={{ '--card-color': color, '--card-color-alpha': `${color}33` } as React.CSSProperties}
    >
      <div className={styles.glow}></div>
      <div className={`display-number ${styles.value}`}>
        {value}
      </div>
      <div className={styles.label}>
        {label}
      </div>
    </div>
  );
}
