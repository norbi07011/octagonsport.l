import React from 'react';
import { CategorySpotlight } from './CategorySpotlight';
import { SPOTLIGHTS } from '../../data/spotlights';

/** Legion Kids – „Kies je fighter” (koszulki Brainrot). Konfiguracja: src/data/spotlights.ts */
export const KidsFighterSelect: React.FC = () => <CategorySpotlight config={SPOTLIGHTS.kids} />;
