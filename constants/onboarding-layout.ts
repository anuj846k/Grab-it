import { Dimensions } from 'react-native';

const { height: windowHeight } = Dimensions.get('window');

/**
 * Hero / image region height shared by onboarding steps that use a hero image (steps 1 & 3).
 */
export const ONBOARDING_HERO_HEIGHT = Math.min(windowHeight * 0.48, 420);

/** Pulls the content block up under the hero gradient for those screens. */
export const ONBOARDING_CONTENT_OVERLAP = ONBOARDING_HERO_HEIGHT * 0.12;

/** Update if onboarding flow length changes. */
export const ONBOARDING_STEP_COUNT = 3;
