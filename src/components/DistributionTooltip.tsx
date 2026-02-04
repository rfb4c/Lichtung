import { Event, Stance } from '../types';
import SpectrumBar from './SpectrumBar';

interface DistributionTooltipProps {
  event: Event;
  currentStance: Stance;
  visible: boolean;
}

export default function DistributionTooltip({
  event,
  currentStance,
  visible,
}: DistributionTooltipProps) {
  if (!visible) return null;

  return <SpectrumBar distribution={event.distribution} currentStance={currentStance} />;
}
