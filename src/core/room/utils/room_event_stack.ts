import {
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from "src/core/event/event";

export class RoomEventStacker<T extends WorkPlace> {
  private eventStack: EventPicker<GameEventIdentifiers, T>[] = [];
  push(content: EventPicker<GameEventIdentifiers, T>) {
    this.eventStack.push(content);
  }

  async toString(): Promise<string> {
    return JSON.stringify(this.eventStack);
  }

  static async toString(
    eventStack: EventPicker<GameEventIdentifiers, WorkPlace>[]
  ): Promise<string> {
    return JSON.stringify(eventStack);
  }

  static async toStack(eventsString: string) {
    return JSON.parse(eventsString);
  }
}
