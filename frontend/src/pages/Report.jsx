import ReportForm from '../features/report/components/ReportForm';

export default function ReportPage({ addToast, setActiveTab, onLoginToggle }) {
  return (
    <ReportForm
      addToast={addToast}
      setActiveTab={setActiveTab}
      onLoginToggle={onLoginToggle}
    />
  );
}
