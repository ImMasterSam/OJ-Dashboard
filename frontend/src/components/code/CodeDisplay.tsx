import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '../../css/CodeDisplay.module.css';

interface CodeDisplayProps {
  submission: any;
  onBack?: () => void;
}

const LANGUAGE_MAP: Record<string, string> = {
  'C': 'c',
  'C++': 'cpp',
  'C++ 11': 'cpp',
  'C++ 14': 'cpp',
  'C++ 17': 'cpp',
  'Java': 'java',
  'Python': 'python',
  'Python 3': 'python',
  'Python3': 'python',
  'JavaScript': 'javascript',
  'Node.js': 'javascript',
  'Ruby': 'ruby',
  'Go': 'go',
  'Rust': 'rust',
  'Swift': 'swift',
  'Kotlin': 'kotlin',
  'PHP': 'php',
  'C#': 'csharp',
  'Pascal': 'pascal'
};

const getHighlightLanguage = (langString: string | null | undefined) => {
  if (!langString) return 'text';
  // Try exact match first
  if (LANGUAGE_MAP[langString]) return LANGUAGE_MAP[langString];

  // Try fuzzy match
  const lowerLang = langString.toLowerCase();
  if (lowerLang.includes('c++') || lowerLang.includes('cpp')) return 'cpp';
  if (lowerLang.includes('c#') || lowerLang.includes('csharp')) return 'csharp';
  if (lowerLang.includes('python')) return 'python';
  if (lowerLang.includes('java') && !lowerLang.includes('javascript')) return 'java';
  if (lowerLang.includes('js') || lowerLang.includes('javascript') || lowerLang.includes('node')) return 'javascript';
  if (lowerLang.includes('ruby')) return 'ruby';
  if (lowerLang.includes('go')) return 'go';
  if (lowerLang.includes('rust')) return 'rust';

  return 'text'; // Fallback
};

const decodeHtmlEntities = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&');
};

export default function CodeDisplay({ submission, onBack }: CodeDisplayProps) {
  return (
    <div className={`glass-card col-span-8 ${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack} title="返回列表">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
          )}
          <span className={styles.headerTitle}>
            {submission ? submission['題目名稱'] : 'Select a submission'}
          </span>
        </div>
        {submission && submission['程式語言'] && (
          <span className={styles.languageBadge}>
            {submission['程式語言']}
          </span>
        )}
      </div>

      <div className={styles.body}>
        {!submission ? (
          <div className={styles.placeholder}>
            <p>請選擇一個提交紀錄以檢視程式碼</p>
          </div>
        ) : !submission['Code'] ? (
          <div className={styles.unsupported}>
            <div className={styles.unsupportedIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.unsupportedIconSvg}>
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h3 className={styles.unsupportedTitle}>
              此平台暫不支援程式碼檢視
            </h3>
            <p className={styles.unsupportedText}>
              很抱歉，目前系統僅開放讀取 <strong className={styles.unsupportedHighlight}>Zerojudge、LeetCode</strong> 的提交原始碼，其他評測平台暫未提供存取權限。
            </p>
          </div>
        ) : (
          <SyntaxHighlighter
            language={getHighlightLanguage(submission['程式語言'])}
            style={vscDarkPlus}
            showLineNumbers={true}
            codeTagProps={{
              style: {
                fontSize: '1.1rem',
                fontFamily: 'Consolas, monospace',
              }
            }}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: 'transparent',
              minHeight: '100%',
            }}
          >
            {decodeHtmlEntities(submission['Code'])}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
