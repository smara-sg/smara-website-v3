export const narrationPauseSeconds = 5;

/** One decoded loop, including silence, keeps repeat timing on the audio clock. */
export function withNarrationPause(context: BaseAudioContext, voice: AudioBuffer) {
  const loop = context.createBuffer(1, voice.length + Math.round(voice.sampleRate * narrationPauseSeconds), voice.sampleRate);
  const samples = loop.getChannelData(0);
  for (let channel = 0; channel < voice.numberOfChannels; channel++) {
    const input = voice.getChannelData(channel);
    for (let i = 0; i < voice.length; i++) samples[i] += input[i] / voice.numberOfChannels;
  }
  // Tiny fades avoid clicks without crossfading or shortening the spoken practice.
  const fade = Math.min(Math.round(voice.sampleRate * 0.01), Math.floor(voice.length / 2));
  for (let i = 0; i < fade; i++) {
    samples[i] *= i / fade;
    samples[voice.length - 1 - i] *= i / fade;
  }
  return loop;
}

export function createNarrationTransport(context: AudioContext, buffer: AudioBuffer, destinations: AudioNode[]) {
  const gain = context.createGain();
  gain.gain.value = 0.9;
  destinations.forEach(destination => gain.connect(destination));
  let source: AudioBufferSourceNode | null = null;
  let offset = 0;
  let started = 0;
  let disposed = false;
  return {
    setActive(active: boolean) {
      if (disposed) return;
      if (active && !source) {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        started = context.currentTime;
        source.start(0, offset);
      } else if (!active && source) {
        offset = (offset + context.currentTime - started) % buffer.duration;
        source.stop();
        source.disconnect();
        source = null;
      }
    },
    dispose() {
      disposed = true;
      source?.stop();
      source?.disconnect();
      source = null;
      gain.disconnect();
    },
  };
}
