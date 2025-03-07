import { act, renderHook } from '@testing-library/react';

import { getTimeFromSeconds, useTimer } from './useTimer';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
});

vi.useFakeTimers().setSystemTime(new Date('1999-03-12'));

describe('getTimeFromSeconds', () => {
  it('Should convert seconds to time units', () => {
    const result = getTimeFromSeconds(90061);

    expect(result.days).toBe(1);
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(1);
  });

  it('Should handle zero seconds', () => {
    const result = getTimeFromSeconds(0);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it('Should handle only seconds', () => {
    const result = getTimeFromSeconds(45);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(45);
  });

  it('Should handle only minutes and seconds', () => {
    const result = getTimeFromSeconds(185);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(3);
    expect(result.seconds).toBe(5);
  });

  it('Should handle only hours, minutes and seconds', () => {
    const result = getTimeFromSeconds(7384);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(3);
    expect(result.seconds).toBe(4);
  });

  it('Should round up decimal seconds', () => {
    const result = getTimeFromSeconds(60.4);

    expect(result.minutes).toBe(1);
    expect(result.seconds).toBe(1);
  });
});

it('Should use timer', () => {
  const { result } = renderHook(() => useTimer(65_000));

  expect(result.current.seconds).toBe(5);
  expect(result.current.minutes).toBe(1);
  expect(result.current.hours).toBe(0);
  expect(result.current.days).toBe(0);
  expect(result.current.active).toBeTruthy();
});

it('Should not be active when disabled', () => {
  const { result } = renderHook(() => useTimer(1000, { immediately: false }));

  expect(result.current.active).toBeFalsy();
});

it('Should decrease time when running', async () => {
  const { result } = renderHook(() => useTimer(60_000));

  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.seconds).toBe(59);
  expect(result.current.minutes).toBe(0);
});

it('Should call onExpire when timer ends', () => {
  const onExpire = vi.fn();
  const { result } = renderHook(() => useTimer(1000, { onExpire }));

  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.seconds).toBe(0);
  expect(result.current.active).toBeFalsy();
  expect(onExpire).toBeCalledTimes(1);
});

it('Should call onTick on each second', () => {
  const onTick = vi.fn();
  renderHook(() => useTimer(2000, { onTick }));

  act(() => vi.advanceTimersToNextTimer());

  expect(onTick).toBeCalledTimes(1);
});

it('Should pause timer', () => {
  const { result } = renderHook(() => useTimer(11_000));

  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.active).toBeTruthy();
  expect(result.current.seconds).toBe(10);

  act(() => result.current.pause());

  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.seconds).toBe(10);
  expect(result.current.active).toBeFalsy();
});

it('Should toggle timer state', () => {
  const { result } = renderHook(() => useTimer(10_000));

  act(() => result.current.toggle());

  expect(result.current.active).toBeFalsy();

  act(() => result.current.toggle());

  expect(result.current.active).toBeTruthy();
});

it('Should restart timer with new time', () => {
  const { result } = renderHook(() => useTimer(11_000));

  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.seconds).toBe(10);

  act(() => result.current.restart(6000));

  expect(result.current.seconds).toBe(6);
  expect(result.current.active).toBeTruthy();
});

it('Should start timer', () => {
  const { result } = renderHook(() => useTimer(11_000));

  act(() => vi.advanceTimersToNextTimer());
  expect(result.current.seconds).toBe(10);

  act(() => result.current.start());

  act(() => vi.advanceTimersToNextTimer());
  expect(result.current.seconds).toBe(10);
});

it('Should resume timer', () => {
  const { result } = renderHook(() => useTimer(11_000, { immediately: false }));

  expect(result.current.active).toBeFalsy();

  act(() => result.current.resume());

  expect(result.current.active).toBeTruthy();
});

it('Should restart timer by method', () => {
  const { result } = renderHook(() => useTimer(11_000));

  act(() => result.current.restart(6000));
  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.active).toBeTruthy();
  expect(result.current.seconds).toBe(5);
});

it('Should restart timer by method with immediately false', () => {
  const { result } = renderHook(() => useTimer(11_000, { immediately: false }));

  act(() => result.current.restart(6000, false));
  act(() => vi.advanceTimersToNextTimer());

  expect(result.current.active).toBeFalsy();
  expect(result.current.seconds).toBe(6);
});

it('Should accept callback as second parameter', () => {
  const callback = vi.fn();
  renderHook(() => useTimer(1000, callback));

  act(() => vi.advanceTimersToNextTimer());

  expect(callback).toBeCalledTimes(1);
});
