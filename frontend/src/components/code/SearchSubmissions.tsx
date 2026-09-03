import { useState } from 'react';
import { useSubsData } from '../../hooks/useSubsData';
import { Code } from 'lucide-react';
import styles from '../../css/SearchSubmissions.module.css';

function WebsiteLogo({ website }: { website?: string }) {
  const [error, setError] = useState(false);

  if (!website || error) {
    return <Code size={24} color="var(--text-secondary)" />;
  }

  return (
    <img
      src={`./OJ logos/${website}.png`}
      alt={website}
      className={styles.logoImage}
      onError={() => setError(true)}
    />
  );
}

const getVerdictColor = (verdict?: string) => {
  const v = verdict?.toUpperCase();
  if (['AC', 'WA', 'TLE', 'CE', 'RE', 'MLE', 'OLE', 'RF'].includes(v || '')) {
    return `var(--color-${v?.toLowerCase()})`;
  }
  return 'var(--text-secondary)';
};

interface SearchSubmissionsProps {
  selectedSubmission: any;
  onSelect: (sub: any) => void;
}

export default function SearchSubmissions({ selectedSubmission, onSelect }: SearchSubmissionsProps) {
  const { rawData } = useSubsData();

  // Filter States
  const [websiteFilter, setWebsiteFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [endTimeFilter, setEndTimeFilter] = useState('');
  const [taskNameFilter, setTaskNameFilter] = useState('');

  // Extract unique options
  const websites = rawData ? Array.from(new Set(rawData.map(sub => sub['網站']).filter(Boolean))) : [];
  const verdicts = rawData ? Array.from(new Set(rawData.map(sub => sub['結果']).filter(Boolean))) : [];

  // Apply filters
  let filteredSubmissions = rawData ? [...rawData] : [];
  if (websiteFilter) {
    filteredSubmissions = filteredSubmissions.filter(sub => sub['網站'] === websiteFilter);
  }
  if (verdictFilter) {
    filteredSubmissions = filteredSubmissions.filter(sub => sub['結果'] === verdictFilter);
  }
  if (startTimeFilter) {
    const startTime = new Date(startTimeFilter).getTime();
    filteredSubmissions = filteredSubmissions.filter(sub => new Date(sub['完成時間']).getTime() >= startTime);
  }
  if (endTimeFilter) {
    const endTime = new Date(endTimeFilter).getTime();
    filteredSubmissions = filteredSubmissions.filter(sub => new Date(sub['完成時間']).getTime() <= endTime);
  }
  if (taskNameFilter) {
    const searchLower = taskNameFilter.toLowerCase();
    filteredSubmissions = filteredSubmissions.filter(sub => sub['題目名稱']?.toLowerCase().includes(searchLower));
  }

  // Sort and limit
  filteredSubmissions.sort((a, b) => new Date(b['完成時間']).getTime() - new Date(a['完成時間']).getTime());
  const hasMore = filteredSubmissions.length > 20;
  const recentSubmissions = filteredSubmissions.slice(0, 20);

  return (
    <div className={`glass-card col-span-4 ${styles.container}`}>
      <h2 className={styles.title}>Search Submissions</h2>

      {/* Top 2x2 Grid Filters */}
      <div className={styles.filterGrid}>
        <select 
          value={websiteFilter} 
          onChange={e => setWebsiteFilter(e.target.value)}
          className={styles.filterInput}
        >
          <option value="">All Websites</option>
          {websites.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select 
          value={verdictFilter} 
          onChange={e => setVerdictFilter(e.target.value)}
          className={styles.filterInput}
        >
          <option value="">All Verdicts</option>
          {verdicts.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <input 
          type="datetime-local" 
          value={startTimeFilter} 
          onChange={e => setStartTimeFilter(e.target.value)}
          title="Start Time"
          className={styles.filterInput}
        />
        <input 
          type="datetime-local" 
          value={endTimeFilter} 
          onChange={e => setEndTimeFilter(e.target.value)}
          title="End Time"
          className={styles.filterInput}
        />
      </div>

      <div className={styles.listContainer}>
        {recentSubmissions.length > 0 ? (
          <div className={styles.list}>
            {recentSubmissions.map((sub, idx) => (
              <div
                key={idx}
                onClick={() => onSelect(sub)}
                className={selectedSubmission === sub ? styles.itemSelected : styles.item}
              >
                {/* Left: Website Logo */}
                <div className={styles.itemLogo}>
                  <WebsiteLogo website={sub['網站']} />
                </div>

                {/* Middle: Time and Task Name */}
                <div className={styles.itemInfo}>
                  <span className={styles.itemTime}>
                    {sub['完成時間']}
                  </span>
                  <span className={styles.itemName}>
                    {sub['題目名稱'] || `Task ${idx + 1}`}
                  </span>
                </div>

                {/* Right: Verdict */}
                <div className={styles.itemVerdictWrapper}>
                  <span
                    className={styles.itemVerdict}
                    style={{ '--verdict-color': getVerdictColor(sub['結果']) } as React.CSSProperties}
                  >
                    {sub['結果']}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            No submissions found.
          </div>
        )}
      </div>

      {/* Bottom Filter & Hint */}
      <div className={styles.bottomArea}>
        {hasMore && (
          <div className={styles.overflowHint}>
            顯示超過 20 筆結果，請增加更多篩選條件
          </div>
        )}
        <input
          type="text"
          placeholder="Search Task Name..."
          value={taskNameFilter}
          onChange={e => setTaskNameFilter(e.target.value)}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
}
