import styles from '../css/Header.module.css';
import KpiCards from './KpiCards';

interface HeaderProps {
  activeTab?: 'dashboard' | 'source-code';
  setActiveTab?: (tab: 'dashboard' | 'source-code') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.headerLogoTitle}>
          <img src="./favicon.svg" alt="logo" className={styles.headerLogo} />
          <h1>
            Online Judge 解題統計
          </h1>
        </div>

        {setActiveTab && activeTab && (
          <div className={`segmented-control ${styles.segmentedControlWrapper}`}>
            <button
              className={`segmented-control-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('dashboard'); }}
            >
              Dashboard
            </button>
            <button
              className={`segmented-control-btn ${activeTab === 'source-code' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('source-code'); }}
            >
              Source Code
            </button>
          </div>
        )}
      </div>

      <div className={styles.headerCenter}>
        <KpiCards />
      </div>

      <div className={styles.headerRight}>
        <a href="https://github.com/ImMasterSam/OJ-Dashboard" target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
          <img src="./github.svg" alt="GitHub Repo" width={50} height={50} />
        </a>
      </div>
    </header>
  );
}
