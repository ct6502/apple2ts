// Small WebAssembly host for the BSD-3-Clause ymfm YM2151 core.
#include "ymfm/ymfm_opm.h"
#include <algorithm>
#include <cstdint>

namespace {
constexpr uint32_t kClock = 3579545;
struct Host final : ymfm::ymfm_interface {
  ymfm::ym2151 chip;
  ymfm::ym2151::output_data output{};
  uint8_t selected = 0;
  uint64_t clocks = 0;
  uint64_t busyEnd = 0;
  double phase = 0.0;
  int16_t prevL = 0, prevR = 0, curL = 0, curR = 0;

  Host() : chip(*this) { chip.reset(); }
  void ymfm_set_busy_end(uint32_t duration) override { busyEnd = clocks + duration; }
  bool ymfm_is_busy() override { return clocks < busyEnd; }
  void step() {
    chip.generate(&output, 1);
    prevL = curL; prevR = curR;
    curL = static_cast<int16_t>(output.data[0]);
    curR = static_cast<int16_t>(output.data[1]);
    clocks += 64;
  }
  void reset() {
    chip.reset(); selected = 0; clocks = busyEnd = 0; phase = 0.0;
    prevL = prevR = curL = curR = 0;
  }
};
Host host;
}

extern "C" {
__attribute__((used)) void ymfm_reset() { host.reset(); }
__attribute__((used)) void ymfm_write(uint32_t port, uint32_t value) {
  value &= 0xff;
  if ((port & 1) == 0) {
    host.selected = static_cast<uint8_t>(value);
    host.chip.write(0, value);
  } else {
    host.chip.write(1, value);
    if (host.selected == 0x08 && (value & 0x78) == 0) host.step();
  }
}
__attribute__((used)) void ymfm_render(int16_t* out, uint32_t count, uint32_t rate) {
  if (rate == 0) return;
  const double ratio = static_cast<double>(kClock / 64) / rate;
  for (uint32_t i = 0; i < count; ++i) {
    host.phase += ratio;
    while (host.phase >= 1.0) {
      host.phase -= 1.0;
      host.step();
    }
    const double f = host.phase;
    out[i * 2] = static_cast<int16_t>(std::clamp(host.prevL + (host.curL - host.prevL) * f, -32768.0, 32767.0));
    out[i * 2 + 1] = static_cast<int16_t>(std::clamp(host.prevR + (host.curR - host.prevR) * f, -32768.0, 32767.0));
  }
}
}
