import { useState } from 'react';
import SearchSubmissions from './code/SearchSubmissions';
import CodeDisplay from './code/CodeDisplay';

export default function SourceCodeView() {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showCode, setShowCode] = useState(false);

  const handleSelect = (sub: any) => {
    setSelectedSubmission(sub);
    setShowCode(true);
  };

  const handleBack = () => {
    setShowCode(false);
  };

  return (
    <div className={`source-code-grid ${showCode ? 'show-code-mobile' : 'show-list-mobile'}`}>
      <SearchSubmissions selectedSubmission={selectedSubmission} onSelect={handleSelect} />
      <CodeDisplay submission={selectedSubmission} onBack={handleBack} />
    </div>
  );
}
