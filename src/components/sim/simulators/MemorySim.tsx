import { useMemo, useState } from 'react';
import { SimLayout } from '@/components/sim/SimLayout';
import { Field, Segmented, ValueChip, inputClass } from '@/components/sim/Bits';
import {
  UNIT_BYTES,
  buildMemoryLayout,
  type CapacityUnit,
  type Endian,
  type MemoryState,
} from '@/sims/logic/memory';

export function MemorySim() {
  const [value, setValue] = useState('0x1A2B3C4D');
  const [wordBytes, setWordBytes] = useState<1 | 2 | 4>(4);
  const [endian, setEndian] = useState<Endian>('little');
  const [start, setStart] = useState('1000');
  const [capacityAmount, setCapacityAmount] = useState('32');
  const [capacityUnit, setCapacityUnit] = useState<CapacityUnit>('MB');
  const build = useMemo(
    () =>
      buildMemoryLayout({
        value,
        wordBytes,
        endian,
        start: Number(start),
        capacityAmount: Number(capacityAmount),
        capacityUnit,
      }),
    [value, wordBytes, endian, start, capacityAmount, capacityUnit],
  );

  return (
    <SimLayout<MemoryState>
      steps={build.steps}
      error={build.error}
      inputs={
        <>
          <Field id="mem-value" label="Word value" hint="Decimal, or hex with 0x (e.g. 0x1A2B3C4D).">
            <input
              id="mem-value"
              className={inputClass}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field id="mem-width" label="Word size">
            <Segmented
              label="Word size"
              value={wordBytes}
              options={[1, 2, 4].map((w) => ({
                value: w as 1 | 2 | 4,
                label: `${w} byte${w > 1 ? 's' : ''}`,
              }))}
              onChange={setWordBytes}
            />
          </Field>
          <Field id="mem-endian" label="Byte order (endianness)">
            <Segmented
              label="Byte order"
              value={endian}
              options={[
                { value: 'little' as Endian, label: 'Little-endian (LSB at lowest addr)' },
                { value: 'big' as Endian,    label: 'Big-endian (MSB at lowest addr)' },
              ]}
              onChange={setEndian}
            />
          </Field>
          <Field id="mem-start" label="Start address" hint="Base byte address in memory.">
            <input
              id="mem-start"
              className={inputClass}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Field id="mem-capacity" label="Memory capacity">
              <input
                id="mem-capacity"
                className={inputClass}
                value={capacityAmount}
                onChange={(e) => setCapacityAmount(e.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field id="mem-unit" label="Unit">
              <select
                id="mem-unit"
                className={inputClass}
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value as CapacityUnit)}
              >
                {(Object.keys(UNIT_BYTES) as CapacityUnit[]).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </>
      }
      assumptions={[
        'Byte-addressed memory: each address names one unique byte.',
        '1 KB = 2^10 bytes, 1 MB = 2^20 bytes, 1 GB = 2^30 bytes.',
        'Address bits = smallest n where 2^n is at least the number of byte locations.',
        'Big-endian: Most significant byte (MSB) is stored at the lowest memory address.',
        'Little-endian: Least significant byte (LSB) is stored at the lowest memory address.',
      ]}
      visual={(step) => {
        const s = step.state;
        const cells = Array.from({ length: wordBytes }, (_, i) => {
          const address = s.start + i;
          const placed = s.bytes.find((b) => b.address === address);
          // Determine byte meaning (MSB or LSB)
          let meaning = `Byte ${i}`;
          if (wordBytes > 1) {
            if (s.endian === 'big') {
              meaning = i === 0 ? 'MSB (Byte 3)' : i === wordBytes - 1 ? 'LSB (Byte 0)' : `Byte ${wordBytes - 1 - i}`;
            } else {
              meaning = i === 0 ? 'LSB (Byte 0)' : i === wordBytes - 1 ? 'MSB (Byte 3)' : `Byte ${i}`;
            }
          }
          return { address, value: placed?.value ?? null, meaning };
        });

        return (
          <div className="flex flex-col gap-6">
            {/* Proper HTML Memory Table */}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Memory byte layout table ({s.endian === 'big' ? 'Big-endian' : 'Little-endian'})
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left font-mono text-xs font-semibold text-slate-600">
                        Address (Decimal)
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-xs font-semibold text-slate-600">
                        Address (Hex)
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-xs font-semibold text-slate-600">
                        Stored Byte
                      </th>
                      <th className="px-4 py-2.5 text-left font-mono text-xs font-semibold text-slate-600">
                        Significance / Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cells.map((c) => (
                      <tr
                        key={c.address}
                        className={c.value ? 'bg-indigo-50/60 font-medium' : 'even:bg-slate-50'}
                      >
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-700 border-b border-slate-100">
                          {c.address}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500 border-b border-slate-100">
                          0x{c.address.toString(16).toUpperCase()}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-sm border-b border-slate-100">
                          {c.value ? (
                            <span className="rounded border border-indigo-200 bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800">
                              0x{c.value}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 border-b border-slate-100">
                          {c.meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Address space metrics */}
            <div className="grid gap-3 sm:grid-cols-2">
              <ValueChip
                label="Total addressable byte locations"
                value={s.locations ? s.locations.toLocaleString('en-US') : '—'}
              />
              <ValueChip
                label="Required address bits (⌈log₂ N⌉)"
                value={s.locations ? `${s.addressBits} bits` : '—'}
                tone="indigo"
              />
            </div>
          </div>
        );
      }}
      output={(step) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <ValueChip
            label="Byte order"
            value={step.state.endian === 'big' ? 'Big-endian' : 'Little-endian'}
            tone="indigo"
          />
          <ValueChip label="Base address" value={String(step.state.start)} />
          <p className="text-xs leading-relaxed text-slate-500 sm:col-span-2">
            {step.state.note || 'Result appears after the address space is calculated.'}
          </p>
        </div>
      )}
    />
  );
}
