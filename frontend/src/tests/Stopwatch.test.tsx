import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from '@testing-library/react';
import Stopwatch from "../components/Stopwatch";
import type { StopwatchStatus } from '../types/customTypes';

// Set up component's props
const startTime: number = Date.now();
const setEndTime: (newEndTime: number) => void = vi.fn();
const setStopwatchStatus: (newStopwatchStatus: StopwatchStatus) => void = vi.fn();

describe('Stopwatch component', () => {
    // Must use fake timers so tests can rely on specific timestamps while not being slow/flaky
    // https://testing-library.com/docs/using-fake-timers/
    beforeEach(() => {
        act(() => { // wrap in act as the fake timers change component state
            vi.useFakeTimers(); // mock timer functions
        });
    });

    // Running all pending timers and switching to real timers using vitest
    afterEach(() => {
        act(() => { // wrap in act as the fake timers change component state
            vi.runOnlyPendingTimers(); // flush all pending timers before moving back to real timers. NOTICE: this must come before useRealTimers() or unexpected behavior can happen!
            vi.useRealTimers();
        });
    });

    it('starts time when set to ON', () => {
        const stopwatchStatus: StopwatchStatus = "on";
        const endTime: number = 0;

        render(
            <Stopwatch startTime={startTime} endTime={endTime} setEndTime={setEndTime} stopwatchStatus={stopwatchStatus} setStopwatchStatus={setStopwatchStatus}/> 
        );

        act(() => {
            vi.advanceTimersByTime(1000); // advance time by 1 second
        });

        const time = screen.getByText(/00:01/i); // ignore the ms as they change every run - just check if the 1 second counted
        expect(time).toBeInTheDocument();
    });

    it('does not go beyond 59:59.99 when set to ON', () => {
        const stopwatchStatus: StopwatchStatus = "on";
        const endTime: number = 0;

        render(
            <Stopwatch startTime={startTime} endTime={endTime} setEndTime={setEndTime} stopwatchStatus={stopwatchStatus} setStopwatchStatus={setStopwatchStatus}/> 
        );

        act(() => {
            vi.advanceTimersByTime(60 * 60 * 1000); // advance time by 1hr (60 minutes * 60 seconds/minute * 1000 milliseconds/second)
        });

        const time = screen.getByText(/59:59.99/i); // the time should cap at this number
        expect(time).toBeInTheDocument();
    }, 20000); // as this test takes longer to complete, do not timeout until after time has passed

    it('stops time when set to OFF', () => {
        const stopwatchStatus: StopwatchStatus = "off";
        const endTime: number = 0;

        render(
            <Stopwatch startTime={startTime} endTime={endTime} setEndTime={setEndTime} stopwatchStatus={stopwatchStatus} setStopwatchStatus={setStopwatchStatus}/> 
        );

        act(() => {
            vi.advanceTimersByTime(1000); // advance time by 1 second - since the stopwatch is off, forwarding time should not cause any changes
        });

        const time = screen.getByText(/00:00.00/i); // the time should not have changed
        expect(time).toBeInTheDocument();
    });

    it('displays custom time when set to CUSTOM', () => {
        const stopwatchStatus: StopwatchStatus = "custom";
        const endTime: number = 20000; // 20 seconds

        render(
            <Stopwatch startTime={startTime} endTime={endTime} setEndTime={setEndTime} stopwatchStatus={stopwatchStatus} setStopwatchStatus={setStopwatchStatus}/> 
        );

        act(() => {
            vi.advanceTimersByTime(1000); // advance time by 1 second - since the stopwatch is custom, forwarding time should not cause any changes
        });

        const time = screen.getByText(/00:20.00/i); // the time should not have changed
        expect(time).toBeInTheDocument();
    });

    it('resets time when set to RESET', () => {
        const stopwatchStatus: StopwatchStatus = "reset";
        const endTime: number = 0;

        render(
            <Stopwatch startTime={startTime} endTime={endTime} setEndTime={setEndTime} stopwatchStatus={stopwatchStatus} setStopwatchStatus={setStopwatchStatus}/> 
        );

        act(() => {
            vi.advanceTimersByTime(1000); // advance time by 1 second - since the stopwatch is reset, forwarding time should not cause any changes
        });

        const time = screen.getByText(/00:00.00/i); // the time should not have changed
        expect(time).toBeInTheDocument();
    });

    it('does not display time when set to TEXT', () => {
        const stopwatchStatus: StopwatchStatus = "text";
        const endTime: number = 0;

        render(
            <Stopwatch startTime={startTime} endTime={endTime} setEndTime={setEndTime} stopwatchStatus={stopwatchStatus} setStopwatchStatus={setStopwatchStatus}/> 
        );

        act(() => {
            vi.advanceTimersByTime(1000); // advance time by 1 second - since the stopwatch is text, forwarding time should not cause any changes
        });

        const time = screen.queryByText(/00:00.00/i); // the time should not exist
        expect(time).toBeNull();
    });
});