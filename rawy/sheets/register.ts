import { StyleSheet, Platform } from 'react-native'
import { Palette } from '@/constants/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 32 : 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoBadge: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Palette.black.pure,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBadgeGradient: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  waveBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: Palette.black.pure,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(15,23,42,0.5)',
    letterSpacing: 2.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ── Card ──────────────────────────────────────────────────────
  card: {
    backgroundColor: Palette.light.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(16,24,40,0.06)',
    shadowColor: Palette.black.pure,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },

  // ── Tab bar ───────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: 'rgba(15,23,42,0.04)',
    borderRadius: 26,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 0,
    height: 44,
    backgroundColor: Palette.black.pure,
    borderRadius: 22,
    shadowColor: Palette.black.pure,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A9BB0',
  },
  activeTabText: {
    color: Palette.white.pure,
  },

  // ── Creator hint ──────────────────────────────────────────────
  creatorHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(17,24,39,0.03)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.04)',
  },
  creatorHintText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },

  // ── Form inputs ───────────────────────────────────────────────
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.light.surface,
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  inputGroupError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
    marginRight: -6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '500',
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 6,
  },
  serverErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  serverErrorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  // ── Submit button ─────────────────────────────────────────────
  submitWrapper: {
    marginTop: 8,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Palette.black.pure,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButton: {
    height: 58,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: Palette.white.pure,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: '#4A5568',
    fontSize: 13,
    marginHorizontal: 12,
    fontWeight: '600',
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7A90',
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: Palette.black.pure,
    fontSize: 14,
    fontWeight: '700',
  },
})

export default styles
