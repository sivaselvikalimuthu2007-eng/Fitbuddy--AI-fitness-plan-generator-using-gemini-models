// Web Audio API synthesizer for workout rest intervals and completion chimes
class SoundController {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 600, duration = 0.15, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback fails gracefully if user hasn't interacted
    }
  }

  playSuccessChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playBeep(freq, 0.25, 'triangle');
        }, i * 110);
      });
    } catch {
      // Ignore
    }
  }

  playRestCountdownWarning() {
    this.playBeep(880, 0.1, 'sine');
  }

  playRestCompleted() {
    this.playBeep(1174.66, 0.35, 'triangle');
  }
}

export const sound = new SoundController();
