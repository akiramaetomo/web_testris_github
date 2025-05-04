/**
 * EventBus: Simple Pub/Sub event bus for game events.
 *
 * Responsibilities:
 *   - on(event: string, callback: function): Subscribe to named events.
 *   - emit(event: string, data?: any): Emit events, notifying all subscribers.
 *
 * Usage Example:
 *   import { EventBus } from './EventBus.js';
 *   // Subscribe to an event
 *   EventBus.on('blockSpawned', () => {
 *     console.log('A block was spawned.');
 *   });
 *   // Emit an event with optional data
 *   EventBus.emit('linesCleared', 3);
 */
class EventBusClass {
    constructor() {
        this.listeners = {};
    }

    /**
     * Subscribe to an event.
     * @param {string} event - Name of the event.
     * @param {function} callback - 
     * 
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Emit an event to all subscribers.
     * @param {string} event - Name of the event.
     * @param {*} [data] - Optional data to pass to callbacks.
     */
    emit(event, data) {
        const subs = this.listeners[event] || [];
        for (const cb of subs) {
            try {
                cb(data);
            } catch (e) {
                console.error(`Error in EventBus listener for '${event}':`, e);
            }
        }
    }
}

//singleton
export const EventBus = new EventBusClass();
