import { lazy, type ComponentType } from 'react';

export interface SimulatorEntry {
  id: string;
  title: string;
  Component: ComponentType;
}

const BaseConversionSim = lazy(() => import('./BaseConversionSim').then((m) => ({ default: m.BaseConversionSim })));
const BinaryArithSim = lazy(() => import('./BinaryArithSim').then((m) => ({ default: m.BinaryArithSim })));
const RippleAdderSim = lazy(() => import('./AdderSim').then((m) => ({ default: m.RippleAdderSim })));
const CarryLookaheadSim = lazy(() => import('./AdderSim').then((m) => ({ default: m.CarryLookaheadSim })));
const ShiftAddSim = lazy(() => import('./ShiftAddSim').then((m) => ({ default: m.ShiftAddSim })));
const BoothSim = lazy(() => import('./BoothSim').then((m) => ({ default: m.BoothSim })));
const DivisionSim = lazy(() => import('./DivisionSim').then((m) => ({ default: m.DivisionSim })));
const CarrySaveSim = lazy(() => import('./CarrySaveSim').then((m) => ({ default: m.CarrySaveSim })));
const CodesSim = lazy(() => import('./CodesSim').then((m) => ({ default: m.CodesSim })));
const MemorySim = lazy(() => import('./MemorySim').then((m) => ({ default: m.MemorySim })));
const IeeeSim = lazy(() => import('./IeeeSim').then((m) => ({ default: m.IeeeSim })));
const GatesExplorer = lazy(() => import('./GatesExplorer').then((m) => ({ default: m.GatesExplorer })));
const AddressingSim = lazy(() => import('./AddressingSim').then((m) => ({ default: m.AddressingSim })));
const DatapathSim = lazy(() => import('./DatapathSim').then((m) => ({ default: m.DatapathSim })));
const PipelineSim = lazy(() => import('./PipelineSim').then((m) => ({ default: m.PipelineSim })));
const PredictorSim = lazy(() => import('./PredictorSim').then((m) => ({ default: m.PredictorSim })));
const FlynnExplorer = lazy(() => import('./ParallelSims').then((m) => ({ default: m.FlynnExplorer })));
const ArraySumSim = lazy(() => import('./ParallelSims').then((m) => ({ default: m.ArraySumSim })));
const MulticoreSim = lazy(() => import('./ParallelSims').then((m) => ({ default: m.MulticoreSim })));
const PollingSim = lazy(() => import('./PollingSim').then((m) => ({ default: m.PollingSim })));

export const SIMULATORS: SimulatorEntry[] = [
  { id: 'base-conversion', title: 'Base conversion workbench', Component: BaseConversionSim },
  { id: 'binary-arith', title: 'Binary addition and subtraction', Component: BinaryArithSim },
  { id: 'ripple', title: 'Ripple-carry adder', Component: RippleAdderSim },
  { id: 'cla', title: 'Carry-lookahead adder', Component: CarryLookaheadSim },
  { id: 'shift-add', title: 'Shift-and-add multiplication', Component: ShiftAddSim },
  { id: 'booth', title: 'Booth signed multiplication', Component: BoothSim },
  { id: 'carry-save', title: 'Carry-save summation', Component: CarrySaveSim },
  { id: 'division', title: 'Restoring and non-restoring division', Component: DivisionSim },
  { id: 'codes', title: 'Code conversion and parity', Component: CodesSim },
  { id: 'memory', title: 'Byte order and address space', Component: MemorySim },
  { id: 'ieee754', title: 'IEEE 754 single precision', Component: IeeeSim },
  { id: 'gates', title: 'Logic gates, adders and De Morgan', Component: GatesExplorer },
  { id: 'addressing', title: 'Addressing modes and instruction cycle', Component: AddressingSim },
  { id: 'datapath', title: 'Single-bus and three-bus datapath', Component: DatapathSim },
  { id: 'pipeline', title: 'Pipeline and hazards', Component: PipelineSim },
  { id: 'predictor', title: '2-bit branch predictor', Component: PredictorSim },
  { id: 'flynn', title: 'Flynn taxonomy explorer', Component: FlynnExplorer },
  { id: 'array-sum', title: 'Data-parallel array sum', Component: ArraySumSim },
  { id: 'multicore', title: 'Multicore thread scheduling', Component: MulticoreSim },
  { id: 'io-polling', title: 'Program-controlled I/O polling', Component: PollingSim },
];

export function findSimulator(id: string): SimulatorEntry | undefined {
  return SIMULATORS.find((s) => s.id === id);
}
