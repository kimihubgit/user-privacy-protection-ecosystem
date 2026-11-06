import Checker from '../../features/scan/components/Checker';
import ProtectBanner from './sections/ProtectBanner';
import ScamTypesSection from './sections/ScamTypesSection';
import FeatureSection from './sections/FeatureSection';
import Integrations from './sections/Integrations';
import ConnectionFlow from './sections/ConnectionFlow';
import AiChatbotIntro from '../../features/chatbot/components/AiChatbotIntro';
import DeveloperApiBanner from './sections/DeveloperApiBanner';
import CommunitySection from './sections/CommunitySection';
import Partners from './sections/Partners';
import FaqSection from './sections/FaqSection';

export default function Home({ addToast, onAiChatToggle }) {
  return (
    <>
      <Checker addToast={addToast} />
      <ProtectBanner addToast={addToast} />
      <ScamTypesSection addToast={addToast} />
      <FeatureSection />
      <Integrations />
      <ConnectionFlow addToast={addToast} />
      <AiChatbotIntro onAiChatToggle={onAiChatToggle} />
      <DeveloperApiBanner addToast={addToast} />
      <CommunitySection />
      <Partners />
      <FaqSection />
    </>
  );
}
