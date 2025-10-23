export enum AppLayoutStyles {
  SIDEBAR = 'SIDEBAR', // B2B Dashboard style (Current design)
  TOPNAV = 'TOPNAV',   // B2C Website style (Future new layout)
}

// Change this one line to switch the entire application's layout:
export const DEFAULT_APP_LAYOUT: AppLayoutStyles = AppLayoutStyles.SIDEBAR;
