import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/ar/narration.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { withNarrationPause, createNarrationTransport } = await import('data:text/javascript;base64,' + Buffer.from(javascript).toString('base64'));
function buffer(channels, length, sampleRate) {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  return { numberOfChannels: channels, length, sampleRate, duration: length / sampleRate, getChannelData: channel => data[channel] };
}
test('voice repeats after exactly five seconds of digital silence, preserving interior speech', () => {
  const voice = buffer(2, 3000, 1000);
  voice.getChannelData(0).fill(0.8);
  voice.getChannelData(1).fill(0.4);
  const loop = withNarrationPause({ createBuffer: buffer }, voice);
  assert.equal(loop.numberOfChannels, 1);
  assert.equal(loop.duration, voice.duration + 5);
  assert.ok(Math.abs(loop.getChannelData(0)[100] - 0.6) < 0.0001);
  assert.equal(loop.getChannelData(0)[0], 0);
  assert.equal(loop.getChannelData(0)[voice.length - 1], 0);
  assert.ok(loop.getChannelData(0).subarray(voice.length).every(value => value === 0));
  assert.equal(voice.getChannelData(0)[100], Math.fround(0.8));
});
test('live and recording receive the same looping voice; review resumes at the preserved audio-clock position', () => {
  const nodes = [], destinations = [{ id: 'monitor' }, { id: 'recording' }], connected = [];
  const gain = { gain: {}, connect: destination => connected.push(destination), disconnect() {} };
  const context = { currentTime: 0, createGain: () => gain, createBufferSource: () => {
    const node = { connect() {}, disconnect() {}, stop() { this.stopped = true; }, start(when, offset) { this.offset = offset; } };
    nodes.push(node); return node;
  } };
  const transport = createNarrationTransport(context, { duration: 186 }, destinations);
  assert.deepEqual(connected, destinations);
  transport.setActive(true);
  transport.setActive(true);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].loop, true);
  context.currentTime = 184;
  transport.setActive(false);
  assert.equal(nodes[0].stopped, true);
  context.currentTime = 200;
  transport.setActive(true);
  assert.equal(nodes[1].offset, 184); // preserve the five-second pause too
  context.currentTime = 205;
  transport.setActive(false);
  transport.setActive(true);
  assert.equal(nodes[2].offset, 3);
  transport.dispose();
  transport.setActive(true);
  assert.equal(nodes.length, 3);
  assert.equal(nodes[2].stopped, true);
});
