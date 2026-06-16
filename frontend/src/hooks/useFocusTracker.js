// src/hooks/useFocusTracker.js
// ═══════════════════════════════════════════════════════════════════════════
//  نظام تتبع التركيز الكامل
//  بيشتغل بـ 3 طرق:
//    1. Tab Visibility  — لو غير التاب
//    2. Idle Detection  — لو مش حارك من X ثانية
//    3. Window Blur     — لو طلع من النافذة
// ═══════════════════════════════════════════════════════════════════════════
import { useEffect, useRef, useCallback, useState } from 'react';

const DEFAULT_CONFIG = {
  idleSeconds:        30,    // ثواني قبل تعتبره شارد
  warningBeforeStop:   5,    // ثواني warning قبل الإيقاف
  alarmVolume:        0.7,
  alarmFrequency:     880,   // Hz
  alarmDuration:      1200,  // ms
  alarmBeeps:         3,
};

export function useFocusTracker({
  isPlaying   = false,   // هل الفيديو بيشتغل دلوقتي؟
  onPause,               // callback لإيقاف الفيديو
  onResume,              // callback لاستئناف الفيديو
  lectureId   = null,    // لتسجيل الجلسة في الـ backend
  config      = {},
} = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { idleSeconds, warningBeforeStop, alarmVolume, alarmFrequency, alarmBeeps } = cfg;

  // ── State ──────────────────────────────────────────────────────────────────
  const [isDistracted, setIsDistracted]     = useState(false);
  const [distractCount, setDistractCount]   = useState(0);
  const [sessionTime, setSessionTime]       = useState(0);    // ثواني مشاهدة فعلية
  const [warningCountdown, setWarnCountdown]= useState(null); // عداد تنازلي للـ warning
  const [feedbackMsg, setFeedbackMsg]       = useState(null); // رسالة للطالب

  // ── Refs ───────────────────────────────────────────────────────────────────
  const idleTimer       = useRef(null);
  const warnTimer       = useRef(null);
  const sessionTimer    = useRef(null);
  const audioCtx        = useRef(null);
  const distractTimesRef= useRef([]);   // سجل أوقات الشرود
  const startTimeRef    = useRef(null);
  const isDistractedRef = useRef(false);

  // ── Audio Context (lazy init) ──────────────────────────────────────────────
  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx.current;
  }, []);

  // ── Alarm ──────────────────────────────────────────────────────────────────
  const playAlarm = useCallback(() => {
    try {
      const ctx  = getAudioCtx();
      const beep = (delay, freq = alarmFrequency) => {
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type      = 'sine';
        osc.frequency.value = freq;
        gain.gain.value     = alarmVolume;
        osc.start(ctx.currentTime + delay);
        osc.stop (ctx.currentTime + delay + 0.25);
        gain.gain.exponentialRampToValueAtTime(
          0.001, ctx.currentTime + delay + 0.25
        );
      };
      for (let i = 0; i < alarmBeeps; i++) {
        beep(i * 0.35);
        beep(i * 0.35 + 0.12, alarmFrequency * 1.25);
      }
    } catch (e) {
      console.warn('Audio alarm failed:', e);
    }
  }, [alarmBeeps, alarmFrequency, alarmVolume, getAudioCtx]);

  // ── Mark distracted ────────────────────────────────────────────────────────
  const markDistracted = useCallback((reason = 'idle') => {
    if (isDistractedRef.current) return;
    isDistractedRef.current = true;
    setIsDistracted(true);
    setDistractCount(n => n + 1);

    const now = new Date();
    distractTimesRef.current.push({
      time  : now.toISOString(),
      reason,
      sessionSecond: sessionTime,
    });

    playAlarm();
    onPause?.();

    // عداد تنازلي في الـ warning overlay
    let countdown = warningBeforeStop;
    setWarnCountdown(countdown);
    warnTimer.current = setInterval(() => {
      countdown -= 1;
      setWarnCountdown(countdown);
      if (countdown <= 0) {
        clearInterval(warnTimer.current);
        setWarnCountdown(null);
      }
    }, 1000);
  }, [warningBeforeStop, playAlarm, onPause, sessionTime]);

  // ── Resume focus ───────────────────────────────────────────────────────────
  const resumeFocus = useCallback(() => {
    if (!isDistractedRef.current) return;
    isDistractedRef.current = false;
    setIsDistracted(false);
    clearInterval(warnTimer.current);
    setWarnCountdown(null);
    resetIdleTimer();
    onResume?.();

    // Feedback message
    const count = distractTimesRef.current.length;
    if (count >= 3) {
      setFeedbackMsg({
        type   : 'warning',
        message: `شردت ${count} مرات في هذه الجلسة 😕`,
        tips   : [
          'حاول تقفل الموبايل بعيد عنك',
          'اشرب كوباية مية قبل ما تكمل',
          'حدد وقت للراحة كل 25 دقيقة (Pomodoro)',
        ],
      });
    } else {
      setFeedbackMsg(null);
    }
  }, [onResume, resetIdleTimer]);

  // ── Idle timer reset ───────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (isPlaying && !isDistractedRef.current) {
      idleTimer.current = setTimeout(() => {
        markDistracted('idle');
      }, idleSeconds * 1000);
    }
  }, [isPlaying, idleSeconds, markDistracted]);

  // ── Activity listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const onActivity = () => {
      if (isDistractedRef.current) return;
      resetIdleTimer();
    };
    const EVENTS = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'];
    EVENTS.forEach(e => document.addEventListener(e, onActivity, { passive: true }));
    return () => EVENTS.forEach(e => document.removeEventListener(e, onActivity));
  }, [resetIdleTimer]);

  // ── Tab visibility ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && isPlaying && !isDistractedRef.current) {
        markDistracted('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isPlaying, markDistracted]);

  // ── Window blur ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onBlur = () => {
      if (isPlaying && !isDistractedRef.current) {
        markDistracted('window_blur');
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [isPlaying, markDistracted]);

  // ── Start/stop idle timer when play state changes ──────────────────────────
  useEffect(() => {
    if (isPlaying) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      resetIdleTimer();
      // Session timer — counts actual watch seconds
      sessionTimer.current = setInterval(() => {
        setSessionTime(t => t + 1);
      }, 1000);
    } else {
      clearTimeout(idleTimer.current);
      clearInterval(sessionTimer.current);
    }
    return () => {
      clearTimeout(idleTimer.current);
      clearInterval(sessionTimer.current);
    };
  }, [isPlaying, resetIdleTimer]);

  // ── Session summary ────────────────────────────────────────────────────────
  const getSessionSummary = useCallback(() => ({
    lectureId,
    totalWatchSeconds : sessionTime,
    distractedCount   : distractTimesRef.current.length,
    distractedTimes   : distractTimesRef.current,
    focusScore        : sessionTime > 0
      ? Math.max(0, 100 - (distractTimesRef.current.length * 10))
      : 0,
  }), [lectureId, sessionTime]);

  // ── Dismiss feedback ───────────────────────────────────────────────────────
  const dismissFeedback = useCallback(() => setFeedbackMsg(null), []);

  return {
    isDistracted,
    distractCount,
    sessionTime,
    warningCountdown,
    feedbackMsg,
    resumeFocus,
    getSessionSummary,
    dismissFeedback,
    playAlarm,
  };
}