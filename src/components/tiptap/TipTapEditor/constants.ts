import type { PageSettings } from './types';

// A4 portrait with Word's default 1-inch margins
export const DEFAULT_PAGE_SETTINGS: PageSettings = {
    topMargin: 25.4,
    bottomMargin: 25.4,
    leftMargin: 25.4,
    rightMargin: 25.4,
    orientation: 'portrait',
};

// Gray gap between A4 sheets, in px
export const PAGE_GAP_PX = 24;
