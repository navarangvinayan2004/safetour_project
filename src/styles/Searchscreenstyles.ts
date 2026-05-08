import { StyleSheet, Platform } from "react-native";

// ─────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────

const COLORS = {
  // Backgrounds
  screenBackground: "#F7F8FA",
  inputBackground: "#FFFFFF",
  itemBackground: "#FFFFFF",
  itemPressedBackground: "#F0F4FF",

  // Borders
  inputBorder: "#DDE1EA",
  itemDivider: "#ECEEF2",
  focusBorder: "#3B5BDB",

  // Text
  primaryText: "#1A1D23",
  secondaryText: "#6B7280",
  placeholderText: "#A3A9B7",

  // Accent
  accent: "#3B5BDB",
  accentLight: "#EEF2FF",

  // Shadow
  shadowColor: "#000000",
};

const TYPOGRAPHY = {
  fontSizeSmall: 13,
  fontSizeBase: 15,
  fontSizeMedium: 16,
  lineHeightBase: 22,
  fontWeightRegular: "400" as const,
  fontWeightMedium: "500" as const,
  fontWeightSemiBold: "600" as const,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
};

// ─────────────────────────────────────────────
// Shadows
// ─────────────────────────────────────────────

const shadowLight = Platform.select({
  ios: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

const shadowMedium = Platform.select({
  ios: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

// ─────────────────────────────────────────────
// StyleSheet
// ─────────────────────────────────────────────

export const styles = StyleSheet.create({

  // ── Layout ──────────────────────────────────

  container: {
    flex: 1,
    backgroundColor: COLORS.screenBackground,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },

  // ── Search Input ────────────────────────────

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    ...shadowLight,
  },

  inputWrapperFocused: {
    borderColor: COLORS.focusBorder,
  },

  input: {
    flex: 1,
    height: 50,
    fontSize: TYPOGRAPHY.fontSizeMedium,
    fontWeight: TYPOGRAPHY.fontWeightRegular,
    color: COLORS.primaryText,
    paddingVertical: SPACING.md,
  },

  inputIcon: {
    marginRight: SPACING.sm,
    color: COLORS.placeholderText,
  },

  clearButton: {
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.sm,
  },

  // ── Results List ────────────────────────────

  listContent: {
    paddingBottom: SPACING.xxl,
  },

  listContainer: {
    backgroundColor: COLORS.itemBackground,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.itemDivider,
    overflow: "hidden",
    ...shadowMedium,
  },

  // ── Result Item ─────────────────────────────

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.itemDivider,
    backgroundColor: COLORS.itemBackground,
  },

  itemPressed: {
    backgroundColor: COLORS.itemPressedBackground,
  },

  itemLast: {
    borderBottomWidth: 0,
  },

  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  itemContent: {
    flex: 1,
  },

  // ── Text ────────────────────────────────────

  place: {
    fontSize: TYPOGRAPHY.fontSizeBase,
    fontWeight: TYPOGRAPHY.fontWeightMedium,
    color: COLORS.primaryText,
    lineHeight: TYPOGRAPHY.lineHeightBase,
  },

  placeSubtitle: {
    fontSize: TYPOGRAPHY.fontSizeSmall,
    fontWeight: TYPOGRAPHY.fontWeightRegular,
    color: COLORS.secondaryText,
    marginTop: SPACING.xs,
  },

  // ── Empty / Loading States ───────────────────

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl * 2,
  },

  emptyText: {
    fontSize: TYPOGRAPHY.fontSizeBase,
    color: COLORS.secondaryText,
    textAlign: "center",
    marginTop: SPACING.md,
  },

  emptyHint: {
    fontSize: TYPOGRAPHY.fontSizeSmall,
    color: COLORS.placeholderText,
    textAlign: "center",
    marginTop: SPACING.sm,
  },

  // ── Section Label ───────────────────────────

  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSizeSmall,
    fontWeight: TYPOGRAPHY.fontWeightSemiBold,
    color: COLORS.secondaryText,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },

});

export { COLORS, SPACING, RADIUS, TYPOGRAPHY };